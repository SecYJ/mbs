import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "#app/db/index";
import {
    getBookingDetails,
    getBookingEvents,
    getBookingRoom,
    getBookingRoomCatalog,
    getBookingRooms,
    getBookingSummary,
    getBookingUsers,
} from "#app/modules/booking/booking.repo";

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

const noFilters = { capacity: 0, equipment: [], location: [] };
const eventScope = {
    ...noFilters,
    rangeStart: "2099-01-02T09:00:00.000Z",
    rangeEnd: "2099-01-02T18:00:00.000Z",
};

describe.skipIf(!process.env.TEST_DATABASE_URL)("booking read queries against PostgreSQL", () => {
    beforeAll(async () => {
        await db.$client.query(`
            SET search_path TO pg_temp;
            CREATE TEMP TABLE "user" (id text PRIMARY KEY, name text NOT NULL, email text NOT NULL);
            CREATE TEMP TABLE rooms (
                room_id uuid PRIMARY KEY, name text NOT NULL, location text NOT NULL,
                available boolean NOT NULL, capacity integer NOT NULL, max_booking_duration_hours integer NOT NULL
            );
            CREATE TEMP TABLE equipment (
                equipment_id uuid PRIMARY KEY, name text NOT NULL, brand text NOT NULL, model text NOT NULL
            );
            CREATE TEMP TABLE room_equipment (room_id uuid NOT NULL, equipment_id uuid NOT NULL);
            CREATE TEMP TABLE bookings (
                booking_id uuid PRIMARY KEY, room_id uuid NOT NULL, user_id text NOT NULL,
                start_time timestamptz NOT NULL, end_time timestamptz NOT NULL, title text NOT NULL,
                description text, status text NOT NULL, cancelled_at timestamptz, cancelled_by text, cancel_reason text,
                created_at timestamptz, updated_at timestamptz
            );
            CREATE TEMP TABLE attendees (
                booking_id uuid NOT NULL, user_id text NOT NULL, status text NOT NULL,
                PRIMARY KEY (booking_id, user_id)
            );
        `);
    });

    afterAll(async () => {
        await db.$client.end();
    });

    beforeEach(async () => {
        await db.$client.query(`
            TRUNCATE pg_temp.attendees, pg_temp.bookings, pg_temp.room_equipment,
                pg_temp.equipment, pg_temp.rooms, pg_temp."user";
            INSERT INTO "user" (id, name, email) VALUES
                ('current', 'Current User', 'current@example.test'),
                ('other', 'Other Organizer', 'other@example.test'),
                ('guest-b', 'Alex', 'b@example.test'),
                ('guest-a', 'Alex', 'a@example.test');
            INSERT INTO rooms (room_id, name, location, available, capacity, max_booking_duration_hours) VALUES
                ('00000000-0000-0000-0000-000000000100', 'Alpha', 'East Wing', true, 8, 4),
                ('00000000-0000-0000-0000-000000000101', 'Beta', 'West Wing', true, 4, 8),
                ('00000000-0000-0000-0000-000000000102', 'Disabled', 'North Wing', false, 10, 4),
                ('00000000-0000-0000-0000-000000000103', 'Empty', 'West Wing', true, 2, 4);
            INSERT INTO equipment (equipment_id, name, brand, model) VALUES
                ('00000000-0000-0000-0000-000000000200', 'Projector', 'Brand A', 'Model A'),
                ('00000000-0000-0000-0000-000000000201', 'Whiteboard', 'Brand B', 'Model B'),
                ('00000000-0000-0000-0000-000000000202', 'Projector', 'Brand C', 'Model C'),
                ('00000000-0000-0000-0000-000000000203', 'Camera', 'Brand D', 'Model D');
            INSERT INTO room_equipment (room_id, equipment_id) VALUES
                ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000200'),
                ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000201'),
                ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000202'),
                ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000200'),
                ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000203');
            INSERT INTO bookings (booking_id, room_id, user_id, start_time, end_time, title, status)
            SELECT id::uuid, room::uuid, owner, start_time::timestamptz, end_time::timestamptz, title, status
            FROM (VALUES
                ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000100', 'current', '2099-01-02 10:00Z', '2099-01-02 11:00Z', 'Owned meeting', 'active'),
                ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000100', 'other', '2099-01-02 12:00Z', '2099-01-02 13:00Z', 'Invited meeting', 'active'),
                ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000102', 'other', '2099-01-02 10:00Z', '2099-01-02 11:00Z', 'Disabled room meeting', 'active'),
                ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000100', 'other', '2099-01-02 08:00Z', '2099-01-02 09:00Z', 'Before range', 'active'),
                ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000100', 'other', '2099-01-02 18:00Z', '2099-01-02 19:00Z', 'After range', 'active'),
                ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000100', 'current', '2099-01-02 14:00Z', '2099-01-02 15:00Z', 'Cancelled meeting', 'cancelled'),
                ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000100', 'other', '2099-01-02 13:00Z', '2099-01-02 14:00Z', 'Solo meeting', 'active')
            ) AS fixture(id, room, owner, start_time, end_time, title, status);
            INSERT INTO bookings (booking_id, room_id, user_id, start_time, end_time, title, status) VALUES
                ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000101', 'other', now() - interval '1 hour', now() + interval '1 hour', 'Live meeting', 'active'),
                ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000100', 'current', now() - interval '2 days', now() - interval '1 day', 'Past meeting', 'active');
            UPDATE bookings SET cancelled_at = now(), cancelled_by = 'other', cancel_reason = 'Room closed'
            WHERE booking_id = '00000000-0000-0000-0000-000000000006';
            INSERT INTO attendees (booking_id, user_id, status) VALUES
                ('00000000-0000-0000-0000-000000000001', 'current', 'accepted'),
                ('00000000-0000-0000-0000-000000000001', 'guest-b', 'pending'),
                ('00000000-0000-0000-0000-000000000001', 'guest-a', 'declined'),
                ('00000000-0000-0000-0000-000000000002', 'current', 'pending'),
                ('00000000-0000-0000-0000-000000000006', 'current', 'pending'),
                ('00000000-0000-0000-0000-000000000008', 'current', 'accepted');
        `);
    });

    it("returns ordered available rooms with distinct equipment names and applies every selected equipment filter", async () => {
        const result = await getBookingRooms(noFilters);
        expect(result.map((room) => room.id)).toEqual([100, 101, 103].map(uuid));
        expect(result[0]).toEqual({
            id: uuid(100),
            title: "Alpha",
            location: "East Wing",
            capacity: 8,
            maxBookingDurationHours: 4,
            available: true,
            equipment: ["Projector", "Whiteboard"],
        });
        expect(result[2]?.equipment).toEqual([]);
        expect(
            await getBookingRooms({ capacity: 6, location: ["East Wing"], equipment: ["Projector", "Whiteboard"] }),
        ).toEqual([result[0]]);
        expect(await getBookingRooms({ ...noFilters, equipment: ["Projector", "Camera"] })).toEqual([]);
        expect(await getBookingRooms({ ...noFilters, location: ["North Wing"] })).toEqual([]);
    });

    it("distinguishes disabled and missing rooms, and excludes the current user from invite choices", async () => {
        expect(await getBookingRoom(uuid(102))).toMatchObject({ available: false, equipment: ["Camera"] });
        expect(await getBookingRoom(uuid(999))).toBeNull();
        const choices = await getBookingUsers("current");
        expect(choices).toHaveLength(3);
        expect(choices.map((person) => person.name)).toEqual(["Alex", "Alex", "Other Organizer"]);
        expect(choices.some((person) => person.id === "current")).toBe(false);
    });

    it("filters events by overlap and room scope while preserving paired visible attendee arrays", async () => {
        const result = await getBookingEvents("current", eventScope);
        expect(result.map((event) => event.id)).toEqual([1, 2, 9].map(uuid));
        expect(result[0]).toEqual({
            id: uuid(1),
            resourceId: uuid(100),
            title: "Owned meeting",
            start: new Date("2099-01-02T10:00:00.000Z"),
            end: new Date("2099-01-02T11:00:00.000Z"),
            extendedProps: {
                resourceId: uuid(100),
                organizer: "Current User",
                description: "",
                attendees: ["Alex", "Alex"],
                attendeeIds: ["guest-a", "guest-b"],
                canManage: true,
            },
        });
        expect(result[1]?.extendedProps).toMatchObject({ attendees: [], attendeeIds: [], canManage: false });
        expect(await getBookingEvents("current", { ...eventScope, equipment: ["Camera"] })).toEqual([]);
        const disabledRoomEvents = await getBookingEvents("current", { ...eventScope, roomId: uuid(102) });
        expect(disabledRoomEvents.map((event) => event.id)).toEqual([uuid(3)]);
    });

    it("returns catalog choices only from available rooms and counts all active bookings plus the live subset", async () => {
        expect(await getBookingRoomCatalog()).toEqual({
            totalRoomCount: 3,
            allEquipment: ["Projector", "Whiteboard"],
            allLocations: ["East Wing", "West Wing"],
        });
        expect(await getBookingSummary()).toEqual({ bookingCount: 7, liveBookingCount: 1 });
    });

    it("shapes detail relationships in the query and preserves optional fields and attendance visibility", async () => {
        const result = await getBookingDetails("current", uuid(1));
        expect(result).toMatchObject({
            booking: {
                id: uuid(1),
                description: "",
                cancelReason: "",
                cancelledAt: null,
                createdAt: null,
                updatedAt: null,
            },
            room: { id: uuid(100), name: "Alpha", available: true },
            organizer: { id: "current", name: "Current User", email: "current@example.test" },
            cancelledBy: null,
            currentUserAttendance: { status: "accepted" },
            isOrganizer: true,
            canRespond: true,
        });
        expect(result?.booking.start).toBeInstanceOf(Date);
        expect(result?.attendees).toEqual([
            { id: "guest-a", name: "Alex", email: "a@example.test", status: "declined" },
            { id: "guest-b", name: "Alex", email: "b@example.test", status: "pending" },
        ]);
        expect(result?.equipment).toEqual([
            { name: "Projector", brand: "Brand A", model: "Model A" },
            { name: "Projector", brand: "Brand C", model: "Model C" },
            { name: "Whiteboard", brand: "Brand B", model: "Model B" },
        ]);
        expect(await getBookingDetails("current", uuid(9))).toMatchObject({
            attendees: [],
            currentUserAttendance: null,
            isOrganizer: false,
            canRespond: false,
        });
        expect(await getBookingDetails("unrelated", uuid(1))).toMatchObject({
            currentUserAttendance: null,
            isOrganizer: false,
            canRespond: false,
        });
        expect(await getBookingDetails("current", uuid(999))).toBeNull();
    });

    it("preserves cancellation attribution and disallows responding to cancelled or past bookings", async () => {
        expect(await getBookingDetails("current", uuid(6))).toMatchObject({
            booking: { status: "cancelled", cancelReason: "Room closed", cancelledAt: expect.any(Date) },
            cancelledBy: { id: "other", name: "Other Organizer", email: "other@example.test" },
            currentUserAttendance: { status: "pending" },
            canRespond: false,
        });
        expect(await getBookingDetails("current", uuid(8))).toMatchObject({
            currentUserAttendance: { status: "accepted" },
            canRespond: false,
        });
    });

    it("returns empty arrays and zero counts when there are no available rooms", async () => {
        await db.$client.query("UPDATE rooms SET available = false");
        expect(await getBookingRooms(noFilters)).toEqual([]);
        expect(await getBookingEvents("current", eventScope)).toEqual([]);
        expect(await getBookingRoomCatalog()).toEqual({ totalRoomCount: 0, allEquipment: [], allLocations: [] });
        expect(await getBookingSummary()).toEqual({ bookingCount: 0, liveBookingCount: 0 });
    });
});
