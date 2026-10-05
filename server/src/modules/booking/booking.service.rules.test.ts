import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "#app/db/index";
import { ForbiddenError } from "#app/errors/forbiddenError";
import { ValidationError } from "#app/errors/validationError";
import * as repo from "#app/modules/booking/booking.repo";
import { cancelBookingService, createBookingService, updateBookingService } from "#app/modules/booking/booking.service";

// These tests mock the repo, so they run without a database. booking.service.test.ts covers the same
// workflows against PostgreSQL.
const { tx } = vi.hoisted(() => ({ tx: { name: "transaction" } }));
vi.mock("#app/db/index", () => ({
    db: { name: "database", transaction: vi.fn((run: (transaction: unknown) => unknown) => run(tx)) },
}));
vi.mock("#app/modules/booking/booking.repo");

const hour = 3_600_000;
const bookingId = "00000000-0000-4000-8000-0000000000b1";
const roomId = "00000000-0000-4000-8000-000000000001";

function existingBooking(overrides: Partial<NonNullable<Awaited<ReturnType<typeof repo.getBookingForChange>>>> = {}) {
    return {
        id: bookingId,
        roomId,
        userId: "owner",
        title: "Planning",
        status: "active" as const,
        startTime: new Date(Date.now() + 24 * hour),
        endTime: new Date(Date.now() + 25 * hour),
        roomName: "Room A",
        roomLocation: "East Wing",
        ...overrides,
    };
}

function updateInput(existing: ReturnType<typeof existingBooking>, overrides = {}) {
    return {
        bookingId,
        roomId: existing.roomId,
        title: existing.title,
        startTime: existing.startTime.toISOString(),
        endTime: existing.endTime.toISOString(),
        description: "",
        attendeeIds: [],
        ...overrides,
    };
}

// The ICU version decides whether a narrow no-break space sits before AM/PM, so compare with plain spaces.
function plain(message: unknown) {
    return String(message).replaceAll(/\s/g, " ");
}

function exclusionViolation() {
    // Drizzle wraps the driver error, and the original one (with the code) is its cause.
    return Object.assign(new Error("Failed query: insert into bookings"), {
        cause: Object.assign(new Error("conflicting key value violates exclusion constraint"), { code: "23P01" }),
    });
}

beforeEach(() => {
    vi.mocked(repo.lockBookingRoom).mockResolvedValue({ available: true, maxBookingDurationHours: 8 });
    vi.mocked(repo.getExistingAttendeeCount).mockImplementation(async (ids) => ids.length);
    vi.mocked(repo.getOverlappingBooking).mockResolvedValue(undefined);
    vi.mocked(repo.insertBooking).mockResolvedValue({ id: bookingId });
    vi.mocked(repo.updateBooking).mockResolvedValue({ id: bookingId });
    vi.mocked(repo.cancelBooking).mockResolvedValue({ id: bookingId });
    vi.mocked(repo.addBookingAttendees).mockImplementation(async (_bookingId, ids) => ids);
    vi.mocked(repo.removeBookingAttendeesExcept).mockResolvedValue([]);
    vi.mocked(repo.getBookingRecipientIds).mockResolvedValue(["guest"]);
    vi.mocked(repo.insertBookingNotifications).mockResolvedValue(undefined);
});

describe("cancelling a booking", () => {
    it.each([
        ["the organizer", "owner", "user"],
        ["an admin", "admin-1", "admin"],
        ["a super admin", "root", "super_admin"],
    ])("allows %s to cancel", async (_name, userId, role) => {
        vi.mocked(repo.getBookingForChange).mockResolvedValue(existingBooking());

        await expect(cancelBookingService(userId, role, { bookingId, cancelReason: "Moved" })).resolves.toEqual({
            id: bookingId,
        });

        // Only the organizer's own bookings are matched for ordinary users; admins may cancel any booking.
        expect(repo.cancelBooking).toHaveBeenCalledExactlyOnceWith(bookingId, userId, role !== "user", "Moved", tx);
    });

    it("rejects other users without touching the booking", async () => {
        vi.mocked(repo.getBookingForChange).mockResolvedValue(existingBooking());

        await expect(cancelBookingService("someone", "user", { bookingId })).rejects.toBeInstanceOf(ForbiddenError);
        expect(repo.cancelBooking).not.toHaveBeenCalled();
        expect(repo.insertBookingNotifications).not.toHaveBeenCalled();
    });

    it("tells the organizer when someone else cancels, and only the attendees when the organizer does", async () => {
        vi.mocked(repo.getBookingForChange).mockResolvedValue(existingBooking());

        await cancelBookingService("owner", "user", { bookingId });
        await cancelBookingService("admin-1", "admin", { bookingId });
        await cancelBookingService("owner", "admin", { bookingId }, true);

        expect(
            vi.mocked(repo.getBookingRecipientIds).mock.calls.map(([, includeOrganizer]) => includeOrganizer),
        ).toEqual([false, true, true]);
    });

    it("writes the cancellation message in the app time zone", async () => {
        vi.mocked(repo.getBookingForChange).mockResolvedValue(
            existingBooking({
                startTime: new Date("2099-09-20T01:00:00Z"),
                endTime: new Date("2099-09-20T02:30:00Z"),
            }),
        );

        await cancelBookingService("owner", "user", { bookingId });

        const message = vi.mocked(repo.insertBookingNotifications).mock.calls[0]?.[2];
        expect(plain(message)).toBe(
            "Booking canceled: Planning in Room A, East Wing on Sep 20, 2099 from 9:00 AM to 10:30 AM",
        );
    });

    it("rejects bookings that are already cancelled or finished", async () => {
        vi.mocked(repo.getBookingForChange).mockResolvedValueOnce(existingBooking({ status: "cancelled" }));
        await expect(cancelBookingService("owner", "user", { bookingId })).rejects.toThrow("already cancelled");

        vi.mocked(repo.getBookingForChange).mockResolvedValueOnce(
            existingBooking({ startTime: new Date(Date.now() - 2 * hour), endTime: new Date(Date.now() - hour) }),
        );
        await expect(cancelBookingService("owner", "user", { bookingId })).rejects.toThrow("Past bookings");
    });
});

describe("editing a booking", () => {
    it("stays organizer-only, even for admins", async () => {
        const existing = existingBooking();
        vi.mocked(repo.getBookingForChange).mockResolvedValue(existing);

        await expect(updateBookingService("admin-1", updateInput(existing))).rejects.toBeInstanceOf(ForbiddenError);
        expect(repo.updateBooking).not.toHaveBeenCalled();
    });

    it("rejects cancelled bookings", async () => {
        const existing = existingBooking({ status: "cancelled" });
        vi.mocked(repo.getBookingForChange).mockResolvedValue(existing);

        await expect(updateBookingService("owner", updateInput(existing))).rejects.toThrow(
            "Cancelled bookings cannot be edited",
        );
        expect(repo.updateBooking).not.toHaveBeenCalled();
    });

    it("rejects bookings that already ended", async () => {
        const existing = existingBooking({
            startTime: new Date(Date.now() - 2 * hour),
            endTime: new Date(Date.now() - hour),
        });
        vi.mocked(repo.getBookingForChange).mockResolvedValue(existing);

        await expect(updateBookingService("owner", updateInput(existing))).rejects.toThrow("Past bookings");
    });

    describe("while the meeting is running", () => {
        const running = () =>
            existingBooking({ startTime: new Date(Date.now() - hour), endTime: new Date(Date.now() + hour) });

        it("allows changes that keep the start time", async () => {
            const existing = running();
            vi.mocked(repo.getBookingForChange).mockResolvedValue(existing);

            await updateBookingService("owner", updateInput(existing, { title: "Revised" }));
            expect(repo.updateBooking).toHaveBeenCalledOnce();

            const later = new Date(existing.endTime.getTime() + hour).toISOString();
            await updateBookingService("owner", updateInput(existing, { endTime: later }));
            // A changed end time still gets the room, duration, and overlap checks, ignoring the booking itself.
            expect(repo.getOverlappingBooking).toHaveBeenCalledExactlyOnceWith(
                roomId,
                existing.startTime,
                new Date(later),
                bookingId,
                tx,
            );
            expect(repo.updateBooking).toHaveBeenCalledTimes(2);
        });

        it("still requires a future start when the start changes, and an end in the future", async () => {
            const existing = running();
            vi.mocked(repo.getBookingForChange).mockResolvedValue(existing);

            const earlier = new Date(existing.startTime.getTime() - hour / 2).toISOString();
            await expect(updateBookingService("owner", updateInput(existing, { startTime: earlier }))).rejects.toThrow(
                "Start time must be in the future",
            );
            const ended = new Date(Date.now() - 60_000).toISOString();
            await expect(updateBookingService("owner", updateInput(existing, { endTime: ended }))).rejects.toThrow(
                "End time must be in the future",
            );
            expect(repo.updateBooking).not.toHaveBeenCalled();
        });
    });

    it("requires a future start when an upcoming booking moves", async () => {
        const existing = existingBooking();
        vi.mocked(repo.getBookingForChange).mockResolvedValue(existing);
        const past = new Date(Date.now() - 3 * hour).toISOString();

        await expect(
            updateBookingService(
                "owner",
                updateInput(existing, { startTime: past, endTime: new Date(Date.now() - hour).toISOString() }),
            ),
        ).rejects.toThrow("Start time must be in the future");
    });

    it("keeps existing attendees and notifies only the people the edit affects", async () => {
        const existing = existingBooking();
        vi.mocked(repo.getBookingForChange).mockResolvedValue(existing);
        vi.mocked(repo.removeBookingAttendeesExcept).mockResolvedValue(["gone"]);
        vi.mocked(repo.addBookingAttendees).mockResolvedValue(["new"]);

        await updateBookingService(
            "owner",
            updateInput(existing, { title: "Planning v2", attendeeIds: ["stays", "new", "owner", "stays"] }),
        );

        // The organizer and duplicates never reach the database, so nobody's RSVP is reset.
        expect(repo.removeBookingAttendeesExcept).toHaveBeenCalledExactlyOnceWith(bookingId, ["stays", "new"], tx);
        expect(repo.addBookingAttendees).toHaveBeenCalledExactlyOnceWith(bookingId, ["stays", "new"], tx);
        expect(vi.mocked(repo.insertBookingNotifications).mock.calls).toEqual([
            [bookingId, ["new"], "You've been invited to: Planning v2", tx],
            [bookingId, ["stays"], "Booking updated: Planning v2", tx],
            [bookingId, ["gone"], "You've been removed from: Planning v2", tx],
        ]);
    });
});

describe("double-booking guard", () => {
    const start = new Date("2099-09-20T01:00:00Z");
    const input = {
        title: "Planning",
        roomId,
        startTime: start.toISOString(),
        endTime: new Date("2099-09-20T01:30:00Z").toISOString(),
        attendeeIds: [],
    };

    it("turns a database exclusion violation into the usual conflict message", async () => {
        vi.mocked(repo.insertBooking).mockRejectedValue(exclusionViolation());
        // The check inside the transaction found nothing; the follow-up lookup finds the booking that won the race.
        vi.mocked(repo.getOverlappingBooking)
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({
                title: "Standup",
                roomName: "Room A",
                startTime: start,
                endTime: new Date("2099-09-20T01:30:00Z"),
            });

        const failure = await createBookingService("owner", input).catch((error: unknown) => error);

        expect(failure).toBeInstanceOf(ValidationError);
        expect(plain((failure as Error).message)).toBe(
            'Room A is occupied on Sep 20, 2099 from 9:00 AM to 9:30 AM for "Standup". Choose a different time or room.',
        );
        // The failed transaction is gone, so the lookup runs on the main connection pool.
        expect(vi.mocked(repo.getOverlappingBooking).mock.calls[1]?.[4]).toBe(db);
    });

    it("falls back to a generic conflict message and also guards edits", async () => {
        const existing = existingBooking();
        vi.mocked(repo.getBookingForChange).mockResolvedValue(existing);
        vi.mocked(repo.updateBooking).mockRejectedValue(exclusionViolation());

        await expect(updateBookingService("owner", updateInput(existing, { title: "Retitled" }))).rejects.toThrow(
            ValidationError,
        );
        const later = new Date(existing.endTime.getTime() + hour).toISOString();
        await expect(updateBookingService("owner", updateInput(existing, { endTime: later }))).rejects.toThrow(
            "This room is already booked for that time",
        );
    });

    it("does not hide other database errors", async () => {
        const failure = new Error("connection lost");
        vi.mocked(repo.insertBooking).mockRejectedValue(failure);

        await expect(createBookingService("owner", input)).rejects.toBe(failure);
    });

    it("formats the in-check conflict message in the app time zone", async () => {
        vi.mocked(repo.getOverlappingBooking).mockResolvedValue({
            title: " ",
            roomName: "Room A",
            startTime: new Date("2099-09-20T17:00:00Z"),
            endTime: new Date("2099-09-20T18:00:00Z"),
        });

        const failure = await createBookingService("owner", input).catch((error: unknown) => error);

        // 17:00 UTC is already the next morning in Kuala Lumpur.
        expect(plain((failure as Error).message)).toBe(
            "Room A is occupied on Sep 21, 2099 from 1:00 AM to 2:00 AM. Choose a different time or room.",
        );
    });
});
