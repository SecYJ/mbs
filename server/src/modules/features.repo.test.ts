import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "#app/db/index";
import { getMyBookingsDataService, getMyBookingStatsService } from "#app/modules/mybooking/mybooking.service";
import {
    getNotificationsService,
    markAllNotificationsAsReadService,
    markNotificationAsReadService,
} from "#app/modules/notification/notification.service";

vi.mock("#app/db/index", async () => {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { Pool } = await import("pg");

    return {
        db: drizzle({
            client: new Pool({
                connectionString: process.env.TEST_DATABASE_URL ?? "postgresql://unused:unused@127.0.0.1:1/unused",
                max: 1,
            }),
        }),
    };
});

function uuid(value: number) {
    return `00000000-0000-0000-0000-${String(value).padStart(12, "0")}`;
}

describe.skipIf(!process.env.TEST_DATABASE_URL)("feature queries against PostgreSQL", () => {
    beforeAll(async () => {
        // One connection keeps every query in the same temporary schema. No application tables are used.
        await db.$client.query(`
            SET search_path TO pg_temp;
            CREATE TEMP TABLE "user" (id text PRIMARY KEY, name text NOT NULL, email text NOT NULL);
            CREATE TEMP TABLE rooms (room_id uuid PRIMARY KEY, name text NOT NULL, location text NOT NULL);
            CREATE TEMP TABLE bookings (
                booking_id uuid PRIMARY KEY, room_id uuid NOT NULL, user_id text NOT NULL,
                start_time timestamptz NOT NULL, end_time timestamptz NOT NULL, title text NOT NULL,
                description text, status text NOT NULL, cancelled_at timestamptz, cancelled_by text, cancel_reason text
            );
            CREATE TEMP TABLE attendees (
                booking_id uuid NOT NULL, user_id text NOT NULL, status text NOT NULL,
                PRIMARY KEY (booking_id, user_id)
            );
            CREATE TEMP TABLE notifications (
                notification_id uuid PRIMARY KEY, booking_id uuid, user_id text, message text NOT NULL,
                status text NOT NULL, created_at timestamptz
            );
        `);
    });

    afterAll(async () => {
        await db.$client.end();
    });

    beforeEach(async () => {
        await db.$client.query(`
            TRUNCATE pg_temp.notifications, pg_temp.attendees, pg_temp.bookings, pg_temp.rooms, pg_temp."user";
            INSERT INTO "user" (id, name, email) VALUES
                ('current', 'Current User', 'current@example.test'),
                ('other', 'Other Organizer', 'other@example.test'),
                ('guest', 'Guest Person', 'guest@example.test');
            INSERT INTO rooms (room_id, name, location) VALUES
                ('00000000-0000-0000-0000-000000000100', 'Meeting Room', 'East Wing');
            INSERT INTO bookings (booking_id, room_id, user_id, start_time, end_time, title, description, status)
            SELECT id::uuid, '00000000-0000-0000-0000-000000000100'::uuid, owner,
                now() + start_offset::interval, now() + end_offset::interval, title, description, status
            FROM (VALUES
                ('00000000-0000-0000-0000-000000000001', 'current', '1 day', '25 hours', 'Budget 50%_\\ review', NULL, 'active'),
                ('00000000-0000-0000-0000-000000000002', 'other', '2 days', '49 hours', 'Invited meeting', 'Planning notes', 'active'),
                ('00000000-0000-0000-0000-000000000003', 'current', '-1 hour', '1 hour', 'Running meeting', '', 'active'),
                ('00000000-0000-0000-0000-000000000004', 'current', '-2 days', '-47 hours', 'Completed meeting', NULL, 'active'),
                ('00000000-0000-0000-0000-000000000005', 'current', '3 days', '73 hours', 'Cancelled meeting', NULL, 'cancelled'),
                ('00000000-0000-0000-0000-000000000006', 'other', '4 days', '97 hours', 'Private meeting', NULL, 'active'),
                ('00000000-0000-0000-0000-000000000007', 'current', '5 days', '121 hours', 'Solo meeting', NULL, 'active')
            ) AS fixture(id, owner, start_offset, end_offset, title, description, status);
            UPDATE bookings SET cancelled_at = now() - interval '1 day', cancelled_by = 'other', cancel_reason = 'Room closed'
            WHERE booking_id = '00000000-0000-0000-0000-000000000005';
            INSERT INTO attendees (booking_id, user_id, status) VALUES
                ('00000000-0000-0000-0000-000000000001', 'current', 'accepted'),
                ('00000000-0000-0000-0000-000000000001', 'other', 'pending'),
                ('00000000-0000-0000-0000-000000000001', 'guest', 'declined'),
                ('00000000-0000-0000-0000-000000000002', 'current', 'declined');
            INSERT INTO notifications (notification_id, booking_id, user_id, message, status, created_at) VALUES
                ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'current', 'Unread booking', 'unread', now() - interval '1 day'),
                ('00000000-0000-0000-0000-000000000202', NULL, 'current', 'No booking', 'unread', now() - interval '2 days'),
                ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000002', 'current', 'Already read', 'read', now() - interval '3 days'),
                ('00000000-0000-0000-0000-000000000204', NULL, 'current', 'Pending notification', 'pending', NULL),
                ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000006', 'other', 'Private notification', 'unread', now());
        `);
    });

    it("returns owned and invited bookings once, with nested attendees and serialized optional fields", async () => {
        const result = await getMyBookingsDataService({ userId: "current" });

        expect(result.currentUserId).toBe("current");
        expect(result.history.map((booking) => booking.id)).toEqual([4, 3, 1, 2, 5, 7].map(uuid));
        const owned = result.history.find((booking) => booking.id === uuid(1));
        expect(owned).toEqual({
            id: uuid(1),
            roomId: uuid(100),
            title: "Budget 50%_\\ review",
            description: "",
            start: expect.any(String),
            end: expect.any(String),
            status: "upcoming",
            cancelledAt: null,
            cancelReason: "",
            room: { name: "Meeting Room", location: "East Wing" },
            organizer: { id: "current", name: "Current User", email: "current@example.test" },
            cancelledBy: null,
            attendees: expect.arrayContaining([
                { id: "other", name: "Other Organizer", email: "other@example.test", status: "pending" },
                { id: "guest", name: "Guest Person", email: "guest@example.test", status: "declined" },
            ]),
            currentUserAttendance: { status: "accepted" },
        });
        expect(owned?.attendees).toHaveLength(2);
        for (const booking of result.history) {
            expect(new Date(booking.start).toISOString()).toBe(booking.start);
            expect(new Date(booking.end).toISOString()).toBe(booking.end);
        }
        expect(result.history.find((booking) => booking.id === uuid(2))).toMatchObject({
            currentUserAttendance: { status: "declined" },
            attendees: [],
        });
        expect(result.history.find((booking) => booking.id === uuid(7))).toMatchObject({
            attendees: [],
            currentUserAttendance: null,
            description: "",
        });
        const cancelled = result.history.find((booking) => booking.id === uuid(5));
        expect(cancelled).toMatchObject({
            status: "cancelled",
            cancelReason: "Room closed",
            cancelledBy: { id: "other", name: "Other Organizer", email: "other@example.test" },
        });
        expect(new Date(cancelled!.cancelledAt!).toISOString()).toBe(cancelled?.cancelledAt);
    });

    it("filters temporal groups and orders past bookings newest first", async () => {
        const upcoming = await getMyBookingsDataService({ userId: "current", group: "upcoming" });
        const running = await getMyBookingsDataService({ userId: "current", group: "in-progress" });
        const past = await getMyBookingsDataService({ userId: "current", group: "past" });

        expect(upcoming.history.map((booking) => [booking.id, booking.status])).toEqual([
            [uuid(1), "upcoming"],
            [uuid(2), "upcoming"],
            [uuid(7), "upcoming"],
        ]);
        expect(running.history.map((booking) => [booking.id, booking.status])).toEqual([[uuid(3), "in-progress"]]);
        expect(past.history.map((booking) => [booking.id, booking.status])).toEqual([
            [uuid(5), "cancelled"],
            [uuid(4), "completed"],
        ]);
    });

    it("searches related fields and treats percent, underscore, and backslash as literal text", async () => {
        for (const query of ["%", "_", "\\", "  bUDGet  ", "guest@example.test"]) {
            const result = await getMyBookingsDataService({ userId: "current", query });
            expect(result.history.map((booking) => booking.id)).toEqual([uuid(1)]);
        }
        const description = await getMyBookingsDataService({ userId: "current", query: "Planning notes" });
        expect(description.history.map((booking) => booking.id)).toEqual([uuid(2)]);
        const filtered = await getMyBookingsDataService({ userId: "current", group: "past", query: "East Wing" });
        expect(filtered.history.map((booking) => booking.id)).toEqual([uuid(5), uuid(4)]);
        const privateResult = await getMyBookingsDataService({ userId: "current", query: "Private" });
        expect(privateResult.history).toEqual([]);
    });

    it("counts each booking once and returns empty lists and zero counts for an unrelated user", async () => {
        expect(await getMyBookingStatsService("current")).toEqual({ activeCount: 4, attendingCount: 1, ownedCount: 5 });
        expect(await getMyBookingStatsService("nobody")).toEqual({ activeCount: 0, attendingCount: 0, ownedCount: 0 });
        expect(await getMyBookingsDataService({ userId: "nobody" })).toEqual({ currentUserId: "nobody", history: [] });
    });

    it("lists only the user's notifications in date order, keeping null joins and ISO dates", async () => {
        const before = Date.now();
        const result = await getNotificationsService("current");

        expect(result.totalCount).toBe(4);
        expect(result.unreadCount).toBe(2);
        expect(result.items.map((notification) => notification.id)).toEqual([204, 201, 202, 203].map(uuid));
        expect(result.items[1]).toEqual({
            id: uuid(201),
            bookingId: uuid(1),
            message: "Unread booking",
            status: "unread",
            createdAt: expect.any(String),
            booking: {
                id: uuid(1),
                title: "Budget 50%_\\ review",
                startTime: expect.any(String),
                endTime: expect.any(String),
            },
            room: { name: "Meeting Room", location: "East Wing" },
        });
        expect(result.items[2]).toMatchObject({ bookingId: null, booking: null, room: null });
        for (const notification of result.items) {
            expect(new Date(notification.createdAt).toISOString()).toBe(notification.createdAt);
            if (notification.booking) {
                expect(new Date(notification.booking.startTime).toISOString()).toBe(notification.booking.startTime);
                expect(new Date(notification.booking.endTime).toISOString()).toBe(notification.booking.endTime);
            }
        }
        expect(Date.parse(result.items[0]!.createdAt)).toBeGreaterThanOrEqual(before);
        expect(Date.parse(result.items[0]!.createdAt)).toBeLessThanOrEqual(Date.now());
    });

    it("filters unread items without filtering overall counts and handles an empty recipient", async () => {
        const result = await getNotificationsService("current", "unread");

        expect(result.items.map((notification) => notification.id)).toEqual([201, 202].map(uuid));
        expect(result).toMatchObject({ unreadCount: 2, totalCount: 4 });
        expect(await getNotificationsService("nobody")).toEqual({ items: [], unreadCount: 0, totalCount: 0 });
    });

    it("marks a single unread notification idempotently without changing another user's or pending notification", async () => {
        await markNotificationAsReadService("current", uuid(201));
        await markNotificationAsReadService("current", uuid(201));
        await markNotificationAsReadService("current", uuid(204));
        await markNotificationAsReadService("current", uuid(205));
        await markNotificationAsReadService("current", uuid(999));

        const own = await getNotificationsService("current");
        expect(own).toMatchObject({ totalCount: 4, unreadCount: 1 });
        expect(own.items.map((notification) => [notification.id, notification.status])).toEqual([
            [uuid(204), "pending"],
            [uuid(201), "read"],
            [uuid(202), "unread"],
            [uuid(203), "read"],
        ]);
        expect(await getNotificationsService("other")).toMatchObject({ unreadCount: 1, totalCount: 1 });
    });

    it("marks all unread notifications idempotently within the recipient scope, leaving pending unchanged", async () => {
        await markAllNotificationsAsReadService("current");
        await markAllNotificationsAsReadService("current");

        const own = await getNotificationsService("current");
        expect(own).toMatchObject({ totalCount: 4, unreadCount: 0 });
        expect(own.items.map((notification) => [notification.id, notification.status])).toEqual([
            [uuid(204), "pending"],
            [uuid(201), "read"],
            [uuid(202), "read"],
            [uuid(203), "read"],
        ]);
        expect(await getNotificationsService("other")).toMatchObject({ unreadCount: 1, totalCount: 1 });
    });
});
