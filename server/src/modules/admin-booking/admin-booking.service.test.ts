import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    findAdminBookingRoomNames,
    findAdminBookings,
    getAdminBookingCounts,
} from "#app/modules/admin-booking/admin-booking.repo";
import {
    cancelAdminBookingService,
    getAdminBookingsService,
    getAdminBookingStatsService,
} from "#app/modules/admin-booking/admin-booking.service";
import { cancelBookingService } from "#app/modules/booking/booking.service";

vi.mock("#app/modules/admin-booking/admin-booking.repo", () => ({
    findAdminBookingRoomNames: vi.fn(),
    findAdminBookings: vi.fn(),
    getAdminBookingCounts: vi.fn(),
}));
vi.mock("#app/modules/booking/booking.service", () => ({ cancelBookingService: vi.fn() }));

beforeEach(() => {
    vi.resetAllMocks();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("admin booking services", () => {
    it.each([
        [new Date(2026, 8, 20, 12), new Date(2026, 8, 14), new Date(2026, 8, 21)],
        [new Date(2026, 8, 21, 12), new Date(2026, 8, 21), new Date(2026, 8, 28)],
    ])("counts the local calendar day and Monday-to-Monday week for %s", async (now, weekStart, weekEnd) => {
        vi.useFakeTimers();
        vi.setSystemTime(now);
        vi.mocked(getAdminBookingCounts).mockResolvedValue({ popularRoom: null, todayCount: 0, weekCount: 0 });
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);

        expect(await getAdminBookingStatsService()).toEqual({ popularRoom: null, todayCount: 0, weekCount: 0 });
        expect(getAdminBookingCounts).toHaveBeenCalledExactlyOnceWith(todayStart, tomorrowStart, weekStart, weekEnd);
    });

    it("serializes booking dates without changing fields or room ordering", async () => {
        vi.mocked(findAdminBookings).mockResolvedValue([
            {
                id: "booking-id",
                title: "Planning",
                startTime: new Date("2026-09-20T12:00:00Z"),
                endTime: new Date("2026-09-20T13:00:00Z"),
                status: "active",
                room: "Blue room",
                bookedBy: "Organizer",
                userId: "organizer-id",
                attendees: 0,
            },
        ]);
        vi.mocked(findAdminBookingRoomNames).mockResolvedValue(["Blue room", "Red room"]);

        const result = await getAdminBookingsService("admin-id", "super_admin", { q: "", room: "all", status: "all" });

        expect(result).toEqual({
            currentUserId: "admin-id",
            currentUserRole: "super_admin",
            bookings: [
                {
                    id: "booking-id",
                    title: "Planning",
                    startTime: "2026-09-20T12:00:00.000Z",
                    endTime: "2026-09-20T13:00:00.000Z",
                    status: "active",
                    room: "Blue room",
                    bookedBy: "Organizer",
                    userId: "organizer-id",
                    attendees: 0,
                },
            ],
            rooms: ["Blue room", "Red room"],
        });
    });

    it("uses the shared cancellation workflow with organizer notifications enabled", async () => {
        const input = { bookingId: "booking-id", cancelReason: "Room closed" };
        vi.mocked(cancelBookingService).mockResolvedValue({ id: input.bookingId });

        expect(await cancelAdminBookingService("admin-id", "super_admin", input)).toEqual({ id: input.bookingId });
        expect(cancelBookingService).toHaveBeenCalledExactlyOnceWith("admin-id", "super_admin", input, true);
    });
});
