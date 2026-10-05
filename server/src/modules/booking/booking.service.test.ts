import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "#app/db/index";
import { ForbiddenError } from "#app/errors/forbiddenError";
import { NotFoundError } from "#app/errors/notFoundError";
import { ValidationError } from "#app/errors/validationError";
import {
    cancelBookingService,
    createBookingService,
    rsvpBookingService,
    updateBookingService,
} from "#app/modules/booking/booking.service";

const { schemaName } = vi.hoisted(() => ({ schemaName: `booking_test_${crypto.randomUUID().replaceAll("-", "")}` }));

vi.mock("#app/db/index", async () => {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { Pool } = await import("pg");
    return {
        db: drizzle({
            client: new Pool({
                connectionString: process.env.TEST_DATABASE_URL ?? "postgresql://unused:unused@127.0.0.1:1/unused",
                max: 4,
                options: `-c search_path=${schemaName}`,
            }),
        }),
    };
});

const roomId = "00000000-0000-4000-8000-000000000001";

function bookingInput(overrides = {}) {
    return {
        title: "Planning",
        roomId,
        startTime: new Date(Date.now() + 86_400_000).toISOString(),
        endTime: new Date(Date.now() + 90_000_000).toISOString(),
        description: "",
        attendeeIds: ["guest"],
        ...overrides,
    };
}

describe.skipIf(!process.env.TEST_DATABASE_URL)("booking mutations against PostgreSQL", () => {
    beforeAll(async () => {
        // A private schema permits multiple connections for the actual concurrent-request test.
        await db.$client.query(`CREATE SCHEMA ${schemaName}`);
        await db.$client.query(`
            CREATE EXTENSION IF NOT EXISTS btree_gist;
            CREATE TABLE "user" (id text PRIMARY KEY, name text NOT NULL, email text NOT NULL);
            CREATE TABLE rooms (
                room_id uuid PRIMARY KEY, name text NOT NULL, location text NOT NULL,
                available boolean NOT NULL, max_booking_duration_hours integer NOT NULL
            );
            CREATE TABLE bookings (
                booking_id uuid PRIMARY KEY, room_id uuid NOT NULL REFERENCES rooms,
                user_id text NOT NULL REFERENCES "user", title text NOT NULL, description text,
                start_time timestamptz NOT NULL, end_time timestamptz NOT NULL,
                status text NOT NULL DEFAULT 'active', cancelled_at timestamptz,
                cancelled_by text REFERENCES "user", cancel_reason text,
                created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
                CONSTRAINT bookings_end_after_start CHECK (end_time > start_time),
                CONSTRAINT bookings_no_room_overlap EXCLUDE USING gist (
                    room_id WITH =, tstzrange(start_time, end_time) WITH &&
                ) WHERE (status = 'active')
            );
            CREATE TABLE attendees (
                booking_id uuid REFERENCES bookings, user_id text REFERENCES "user",
                status text NOT NULL DEFAULT 'pending', PRIMARY KEY (booking_id, user_id)
            );
            CREATE TABLE notifications (
                notification_id uuid PRIMARY KEY, booking_id uuid REFERENCES bookings,
                user_id text REFERENCES "user", message text NOT NULL,
                status text NOT NULL DEFAULT 'unread', created_at timestamptz DEFAULT now(),
                CONSTRAINT simulate_delivery_failure CHECK (message NOT LIKE '%Fail notification%')
            );
        `);
    });

    afterAll(async () => {
        try {
            await db.$client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
        } finally {
            await db.$client.end();
        }
    });

    beforeEach(async () => {
        await db.$client.query(`
            TRUNCATE notifications, attendees, bookings, rooms, "user";
            INSERT INTO "user" VALUES ('owner', 'Owner', 'owner@example.test'),
                ('guest', 'Guest', 'guest@example.test'), ('other', 'Other', 'other@example.test');
            INSERT INTO rooms VALUES ('${roomId}', 'Room A', 'East Wing', true, 4);
        `);
    });

    it("creates one booking with unique invited attendees and matching notifications", async () => {
        const created = await createBookingService(
            "owner",
            bookingInput({ attendeeIds: ["owner", "guest", "guest", ""] }),
        );
        expect(created.id).toMatch(/^[a-f0-9-]{36}$/);
        expect((await db.$client.query("SELECT user_id, description FROM bookings")).rows).toEqual([
            { user_id: "owner", description: null },
        ]);
        expect((await db.$client.query("SELECT user_id, status FROM attendees")).rows).toEqual([
            { user_id: "guest", status: "pending" },
        ]);
        expect((await db.$client.query("SELECT user_id, message FROM notifications")).rows).toEqual([
            { user_id: "guest", message: "You've been invited to: Planning" },
        ]);
    });

    it("rejects invalid attendees and scheduling rules before creating rows", async () => {
        const input = bookingInput();
        await expect(createBookingService("owner", { ...input, attendeeIds: ["missing"] })).rejects.toThrow(
            "attendees no longer exist",
        );
        await expect(createBookingService("owner", { ...input, startTime: new Date(0).toISOString() })).rejects.toThrow(
            "future",
        );
        await expect(createBookingService("owner", { ...input, endTime: input.startTime })).rejects.toThrow(
            "after start time",
        );
        await expect(
            createBookingService("owner", {
                ...input,
                endTime: new Date(Date.parse(input.startTime) + 5 * 3_600_000).toISOString(),
            }),
        ).rejects.toThrow("cannot exceed 4 hours");
        await expect(
            createBookingService("owner", { ...input, roomId: "00000000-0000-4000-8000-000000000099" }),
        ).rejects.toBeInstanceOf(NotFoundError);
        await db.$client.query("UPDATE rooms SET available = false");
        await expect(createBookingService("owner", input)).rejects.toThrow("not available");
        expect((await db.$client.query("SELECT * FROM bookings")).rows).toEqual([]);
    });

    it("rejects simultaneous overlapping bookings while allowing an adjacent timeslot", async () => {
        const input = bookingInput();
        const results = await Promise.allSettled([
            createBookingService("owner", input),
            createBookingService("other", { ...input, attendeeIds: [] }),
        ]);
        expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
        const rejected = results.find((result) => result.status === "rejected");
        expect(rejected?.status === "rejected" && rejected.reason).toBeInstanceOf(ValidationError);
        expect(rejected?.status === "rejected" && rejected.reason.message).toContain("Room A is occupied on");
        await createBookingService("owner", {
            ...input,
            startTime: input.endTime,
            endTime: new Date(Date.parse(input.endTime) + 3_600_000).toISOString(),
        });
        expect((await db.$client.query("SELECT * FROM bookings")).rows).toHaveLength(2);
    });

    it("restricts edits to the owner, rechecks changed schedules, and preserves atomic updates", async () => {
        const input = bookingInput();
        const created = await createBookingService("owner", input);
        await expect(updateBookingService("other", { ...input, bookingId: created.id })).rejects.toBeInstanceOf(
            ForbiddenError,
        );
        const later = {
            ...input,
            startTime: new Date(Date.parse(input.startTime) + 7_200_000).toISOString(),
            endTime: new Date(Date.parse(input.endTime) + 7_200_000).toISOString(),
        };
        await createBookingService("other", later);
        await expect(updateBookingService("owner", { ...later, bookingId: created.id })).rejects.toThrow("occupied");
        await updateBookingService("owner", {
            ...input,
            bookingId: created.id,
            title: "Revised",
            attendeeIds: ["other"],
        });
        expect(
            (await db.$client.query("SELECT title FROM bookings WHERE booking_id = $1", [created.id])).rows[0].title,
        ).toBe("Revised");
        expect(
            (await db.$client.query("SELECT user_id FROM attendees WHERE booking_id = $1", [created.id])).rows,
        ).toEqual([{ user_id: "other" }]);
        expect(
            (
                await db.$client.query(
                    "SELECT user_id, message FROM notifications WHERE message LIKE '%Revised' ORDER BY user_id",
                )
            ).rows,
        ).toEqual([
            { user_id: "guest", message: "You've been removed from: Revised" },
            { user_id: "other", message: "You've been invited to: Revised" },
        ]);
    });

    it("keeps RSVP answers when editing attendees and notifies only the people affected", async () => {
        const input = bookingInput({ attendeeIds: ["guest", "other"] });
        const created = await createBookingService("owner", input);
        await rsvpBookingService("guest", { bookingId: created.id, status: "accepted" });
        await db.$client.query("DELETE FROM notifications");
        await db.$client.query(`INSERT INTO "user" VALUES ('newcomer', 'Newcomer', 'new@example.test')`);

        await updateBookingService("owner", {
            ...input,
            bookingId: created.id,
            title: "Planning v2",
            attendeeIds: ["guest", "newcomer"],
        });

        expect((await db.$client.query("SELECT user_id, status FROM attendees ORDER BY user_id")).rows).toEqual([
            { user_id: "guest", status: "accepted" },
            { user_id: "newcomer", status: "pending" },
        ]);
        expect((await db.$client.query("SELECT user_id, message FROM notifications ORDER BY user_id")).rows).toEqual([
            { user_id: "guest", message: "Booking updated: Planning v2" },
            { user_id: "newcomer", message: "You've been invited to: Planning v2" },
            { user_id: "other", message: "You've been removed from: Planning v2" },
        ]);
    });

    it("rejects editing a cancelled booking", async () => {
        const input = bookingInput();
        const created = await createBookingService("owner", input);
        await cancelBookingService("owner", "user", { bookingId: created.id });
        await expect(updateBookingService("owner", { ...input, bookingId: created.id })).rejects.toThrow(
            "Cancelled bookings cannot be edited",
        );
    });

    it("rolls back booking and attendee writes when notification insertion fails", async () => {
        const input = bookingInput();
        await expect(createBookingService("owner", { ...input, title: "Fail notification" })).rejects.toThrow();
        expect((await db.$client.query("SELECT * FROM bookings")).rows).toEqual([]);
        const created = await createBookingService("owner", input);
        await expect(
            updateBookingService("owner", {
                ...input,
                bookingId: created.id,
                title: "Fail notification",
                attendeeIds: ["other"],
            }),
        ).rejects.toThrow();
        expect((await db.$client.query("SELECT title FROM bookings")).rows).toEqual([{ title: "Planning" }]);
        expect((await db.$client.query("SELECT user_id FROM attendees")).rows).toEqual([{ user_id: "guest" }]);
        expect((await db.$client.query("SELECT * FROM notifications")).rows).toHaveLength(1);
    });

    it("lets the organizer or any admin cancel, and tells the organizer when someone else does", async () => {
        const created = await createBookingService("owner", bookingInput());
        await expect(cancelBookingService("other", "user", { bookingId: created.id })).rejects.toBeInstanceOf(
            ForbiddenError,
        );
        await cancelBookingService("other", "admin", { bookingId: created.id, cancelReason: "Room needed" });
        expect((await db.$client.query("SELECT status, cancelled_by, cancel_reason FROM bookings")).rows).toEqual([
            { status: "cancelled", cancelled_by: "other", cancel_reason: "Room needed" },
        ]);
        expect(
            (
                await db.$client.query(
                    "SELECT user_id FROM notifications WHERE message LIKE 'Booking canceled:%' ORDER BY user_id",
                )
            ).rows,
        ).toEqual([{ user_id: "guest" }, { user_id: "owner" }]);
        await expect(cancelBookingService("owner", "user", { bookingId: created.id })).rejects.toThrow(
            "already cancelled",
        );
        const second = await createBookingService("owner", bookingInput({ attendeeIds: [] }));
        await cancelBookingService("other", "super_admin", { bookingId: second.id });
    });

    it("notifies attendees only when the organizer cancels their own booking", async () => {
        const created = await createBookingService("owner", bookingInput());
        await cancelBookingService("owner", "user", { bookingId: created.id });
        expect(
            (await db.$client.query("SELECT user_id FROM notifications WHERE message LIKE 'Booking canceled:%'")).rows,
        ).toEqual([{ user_id: "guest" }]);
    });

    it("adds the organizer once to admin-path cancellation notifications", async () => {
        const created = await createBookingService("owner", bookingInput());
        await cancelBookingService("owner", "admin", { bookingId: created.id }, true);
        expect(
            (
                await db.$client.query(
                    "SELECT user_id FROM notifications WHERE message LIKE 'Booking canceled:%' ORDER BY user_id",
                )
            ).rows,
        ).toEqual([{ user_id: "guest" }, { user_id: "owner" }]);
    });

    it("allows only invited users to RSVP and reads only that user's unread booking notifications", async () => {
        const created = await createBookingService("owner", bookingInput({ attendeeIds: ["guest", "other"] }));
        await expect(rsvpBookingService("owner", { bookingId: created.id, status: "accepted" })).rejects.toBeInstanceOf(
            ForbiddenError,
        );
        await rsvpBookingService("guest", { bookingId: created.id, status: "accepted" });
        expect((await db.$client.query("SELECT user_id, status FROM attendees ORDER BY user_id")).rows).toEqual([
            { user_id: "guest", status: "accepted" },
            { user_id: "other", status: "pending" },
        ]);
        expect((await db.$client.query("SELECT user_id, status FROM notifications ORDER BY user_id")).rows).toEqual([
            { user_id: "guest", status: "read" },
            { user_id: "other", status: "unread" },
        ]);
        await cancelBookingService("owner", "user", { bookingId: created.id });
        await expect(rsvpBookingService("guest", { bookingId: created.id, status: "declined" })).rejects.toThrow(
            "Cancelled bookings",
        );
    });

    it("rejects edits, cancellation, and RSVP on ended bookings", async () => {
        const input = bookingInput();
        const created = await createBookingService("owner", input);
        await db.$client.query(
            "UPDATE bookings SET start_time = now() - interval '2 hours', end_time = now() - interval '1 hour'",
        );
        await expect(updateBookingService("owner", { ...input, bookingId: created.id })).rejects.toThrow(
            "Past bookings cannot be edited",
        );
        await expect(cancelBookingService("owner", "user", { bookingId: created.id })).rejects.toThrow(
            "Past bookings cannot be cancelled",
        );
        await expect(rsvpBookingService("guest", { bookingId: created.id, status: "accepted" })).rejects.toThrow(
            "Past bookings cannot receive RSVP",
        );
    });

    it("allows editing a running meeting unless its start time changes", async () => {
        const input = bookingInput();
        const created = await createBookingService("owner", input);
        const startTime = new Date(Date.now() - 3_600_000).toISOString();
        const endTime = new Date(Date.now() + 3_600_000).toISOString();
        await db.$client.query("UPDATE bookings SET start_time = $1, end_time = $2", [startTime, endTime]);
        const running = { ...input, bookingId: created.id, startTime, endTime };

        await updateBookingService("owner", { ...running, title: "Revised" });
        expect((await db.$client.query("SELECT title FROM bookings")).rows).toEqual([{ title: "Revised" }]);

        const longer = new Date(Date.now() + 2 * 3_600_000).toISOString();
        await updateBookingService("owner", { ...running, endTime: longer });
        await expect(
            updateBookingService("owner", {
                ...running,
                startTime: new Date(Date.now() - 1_800_000).toISOString(),
            }),
        ).rejects.toThrow("Start time must be in the future");
        await expect(
            updateBookingService("owner", { ...running, endTime: new Date(Date.now() - 60_000).toISOString() }),
        ).rejects.toThrow("End time must be in the future");
    });

    it("enforces the no-overlap rule in the database itself", async () => {
        const input = bookingInput();
        await createBookingService("owner", input);
        // The database constraint is the last line of defence, so inserting directly must fail with 23P01.
        await expect(
            db.$client.query(
                `INSERT INTO bookings (booking_id, room_id, user_id, title, start_time, end_time)
                 VALUES (gen_random_uuid(), $1, 'other', 'Sneaky', $2, $3)`,
                [roomId, input.startTime, input.endTime],
            ),
        ).rejects.toMatchObject({ code: "23P01" });
    });
});
