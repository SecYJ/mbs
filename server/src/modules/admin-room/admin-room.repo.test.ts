import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "#app/db/index";
import {
    createAdminRoomService,
    deleteAdminRoomService,
    getAdminRoomService,
    getAdminRoomsService,
    updateAdminRoomService,
} from "#app/modules/admin-room/admin-room.service";

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
    return `01990175-b8b8-7000-8000-${String(value).padStart(12, "0")}`;
}

describe.skipIf(!process.env.TEST_DATABASE_URL)("admin room queries against PostgreSQL", () => {
    beforeAll(async () => {
        await db.$client.query(`
            SET search_path TO pg_temp;
            CREATE TEMP TABLE rooms (
                room_id uuid PRIMARY KEY, name text NOT NULL, location text NOT NULL,
                available boolean NOT NULL DEFAULT true, capacity integer NOT NULL,
                max_booking_duration_hours integer NOT NULL DEFAULT 4,
                created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
            );
            CREATE TEMP TABLE equipment (
                equipment_id uuid PRIMARY KEY, name text NOT NULL, brand text NOT NULL, model text NOT NULL
            );
            CREATE TEMP TABLE room_equipment (
                room_id uuid REFERENCES rooms(room_id), equipment_id uuid REFERENCES equipment(equipment_id),
                quantity integer NOT NULL, PRIMARY KEY (room_id, equipment_id)
            );
            CREATE TEMP TABLE room_facilities (room_id uuid REFERENCES rooms(room_id));
            CREATE TEMP TABLE bookings (
                booking_id uuid PRIMARY KEY, room_id uuid REFERENCES rooms(room_id), user_id text NOT NULL,
                start_time timestamptz NOT NULL, end_time timestamptz NOT NULL, title text NOT NULL, status text NOT NULL
            );
            CREATE TEMP TABLE attendees (booking_id uuid REFERENCES bookings(booking_id), user_id text NOT NULL);
            CREATE TEMP TABLE notifications (
                notification_id uuid PRIMARY KEY, booking_id uuid REFERENCES bookings(booking_id), user_id text,
                message text NOT NULL, status text NOT NULL DEFAULT 'unread', created_at timestamptz DEFAULT now()
            );
            CREATE TEMP TABLE blockers (room_id uuid REFERENCES rooms(room_id));
        `);
    });

    afterAll(async () => {
        await db.$client.end();
    });

    beforeEach(async () => {
        await db.$client.query(`
            TRUNCATE blockers, notifications, attendees, bookings, room_facilities, room_equipment, equipment, rooms;
            INSERT INTO rooms (room_id, name, location, capacity, available, max_booking_duration_hours, created_at, updated_at) VALUES
                ('${uuid(1)}', 'Alpha', 'East Wing', 8, true, 4, '2026-01-01T00:00:00Z', NULL),
                ('${uuid(2)}', 'Beta', 'West Wing', 12, false, 8, '2026-02-01T00:00:00Z', '2026-02-02T00:00:00Z'),
                ('${uuid(3)}', 'Gamma', 'East Wing', 8, true, 2, '2026-03-01T00:00:00Z', NULL);
            INSERT INTO equipment (equipment_id, name, brand, model) VALUES
                ('${uuid(11)}', 'Projector', 'Acme', 'P1'), ('${uuid(12)}', 'Screen', 'Acme', 'S1');
            INSERT INTO room_equipment (room_id, equipment_id, quantity) VALUES
                ('${uuid(1)}', '${uuid(11)}', 2), ('${uuid(1)}', '${uuid(12)}', 1), ('${uuid(2)}', '${uuid(12)}', 3);
            INSERT INTO room_facilities VALUES ('${uuid(1)}'), ('${uuid(2)}');
            INSERT INTO bookings (booking_id, room_id, user_id, start_time, end_time, title, status) VALUES
                ('${uuid(21)}', '${uuid(1)}', 'owner', '2026-09-20T09:00:00+08:00', '2026-09-20T10:00:00+08:00', 'Planning', 'active'),
                ('${uuid(22)}', '${uuid(1)}', 'other-owner', '2026-09-20T11:00:00+08:00', '2026-09-20T12:00:00+08:00', 'Review', 'cancelled'),
                ('${uuid(23)}', '${uuid(2)}', 'unaffected', '2026-09-21T09:00:00Z', '2026-09-21T10:00:00Z', 'Other room', 'active');
            INSERT INTO attendees VALUES ('${uuid(21)}', 'guest'), ('${uuid(22)}', 'guest'), ('${uuid(23)}', 'guest');
            INSERT INTO notifications (notification_id, booking_id, user_id, message) VALUES
                ('${uuid(31)}', '${uuid(21)}', 'guest', 'Old invitation'),
                ('${uuid(32)}', '${uuid(23)}', 'guest', 'Keep this invitation');
        `);
    });

    it("returns each room once with equipment quantities, ISO dates, and empty arrays", async () => {
        const result = await getAdminRoomsService({ sort: "name-asc" });

        expect(result.map((room) => room.roomId)).toEqual([uuid(1), uuid(2), uuid(3)]);
        expect(result[0]).toEqual({
            roomId: uuid(1),
            name: "Alpha",
            location: "East Wing",
            available: true,
            capacity: 8,
            maxBookingDurationHours: 4,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: null,
            equipment: [
                { id: uuid(11), name: "Projector", brand: "Acme", model: "P1", quantity: 2 },
                { id: uuid(12), name: "Screen", brand: "Acme", model: "S1", quantity: 1 },
            ],
        });
        expect(result[2]?.equipment).toEqual([]);
        expect(await getAdminRoomService(uuid(1))).toEqual(result[0]);
        await expect(getAdminRoomService(uuid(99))).rejects.toThrow("Room no longer exists");
    });

    it.each([
        ["recent", [3, 2, 1]],
        ["name-asc", [1, 2, 3]],
        ["name-desc", [3, 2, 1]],
        ["capacity-desc", [2, 1, 3]],
        ["capacity-asc", [1, 3, 2]],
        ["duration-desc", [2, 1, 3]],
        ["duration-asc", [3, 1, 2]],
    ] as const)("preserves %s ordering", async (sort, expected) => {
        expect((await getAdminRoomsService({ sort })).map((room) => room.roomId)).toEqual(expected.map(uuid));
    });

    it("filters search and availability while retaining disabled rooms for admins", async () => {
        expect((await getAdminRoomsService({ q: "  wing ", status: "disabled" })).map((room) => room.roomId)).toEqual([
            uuid(2),
        ]);
        expect((await getAdminRoomsService({ q: "ALPHA", status: "available" })).map((room) => room.roomId)).toEqual([
            uuid(1),
        ]);
        expect(await getAdminRoomsService({ q: "missing" })).toEqual([]);
    });

    it("creates and updates rooms with the existing mutation response", async () => {
        const input = {
            name: "Delta",
            location: "North Wing",
            capacity: 4,
            available: true,
            maxBookingDurationHours: 3,
        };
        const created = await createAdminRoomService(input);
        expect(created.room).toMatchObject(input);
        expect(created.room.createdAt).toEqual(expect.any(String));
        const updated = await updateAdminRoomService(created.room.roomId, { ...input, available: false, capacity: 6 });
        expect(updated.room).toMatchObject({ ...input, available: false, capacity: 6 });
        expect(updated.room.updatedAt).toEqual(expect.any(String));
        await expect(updateAdminRoomService(uuid(99), input)).rejects.toThrow("Room no longer exists");
    });

    it("restricts deletion to super admins", async () => {
        await expect(deleteAdminRoomService(uuid(1), "admin")).rejects.toThrow("Only super admins can delete rooms.");
        await expect(getAdminRoomService(uuid(1))).resolves.toMatchObject({ roomId: uuid(1) });
    });

    it("deletes dependencies and notifies only booking organizers with detached notifications", async () => {
        const result = await deleteAdminRoomService(uuid(1), "super_admin");

        expect(result.room).toMatchObject({ roomId: uuid(1), name: "Alpha", updatedAt: null });
        await expect(getAdminRoomService(uuid(1))).rejects.toThrow("Room no longer exists");
        const messages = await db.$client.query(
            "SELECT user_id, booking_id, message, status FROM notifications ORDER BY user_id",
        );
        expect(messages.rows).toEqual([
            { user_id: "guest", booking_id: uuid(23), message: "Keep this invitation", status: "unread" },
            {
                user_id: "other-owner",
                booking_id: null,
                message:
                    'Room deleted: Your booking "Review" in Alpha, East Wing on Sep 20, 2026 from 11:00 AM to 12:00 PM was removed.',
                status: "unread",
            },
            {
                user_id: "owner",
                booking_id: null,
                message:
                    'Room deleted: Your booking "Planning" in Alpha, East Wing on Sep 20, 2026 from 9:00 AM to 10:00 AM was removed.',
                status: "unread",
            },
        ]);
        for (const table of ["bookings", "attendees", "room_facilities", "room_equipment"]) {
            const count = await db.$client.query(`SELECT count(*)::int AS count FROM ${table}`);
            expect(count.rows).toEqual([{ count: 1 }]);
        }
        expect((await db.$client.query("SELECT count(*)::int AS count FROM equipment")).rows).toEqual([{ count: 2 }]);
    });

    it("rolls back deleted dependencies and new notifications when the final delete fails", async () => {
        await db.$client.query("INSERT INTO blockers VALUES ($1)", [uuid(1)]);

        await expect(deleteAdminRoomService(uuid(1), "super_admin")).rejects.toThrow();

        await expect(getAdminRoomService(uuid(1))).resolves.toMatchObject({ roomId: uuid(1) });
        expect((await db.$client.query("SELECT message FROM notifications ORDER BY message")).rows).toEqual([
            { message: "Keep this invitation" },
            { message: "Old invitation" },
        ]);
        expect((await db.$client.query("SELECT count(*)::int AS count FROM bookings")).rows).toEqual([{ count: 3 }]);
        expect((await db.$client.query("SELECT count(*)::int AS count FROM attendees")).rows).toEqual([{ count: 3 }]);
        expect((await db.$client.query("SELECT count(*)::int AS count FROM room_equipment")).rows).toEqual([
            { count: 3 },
        ]);
    });

    it("deletes an empty room and rejects an already missing room", async () => {
        await deleteAdminRoomService(uuid(3), "super_admin");
        await expect(getAdminRoomService(uuid(3))).rejects.toThrow("Room no longer exists");
        await expect(deleteAdminRoomService(uuid(3), "super_admin")).rejects.toThrow("Room no longer exists");
    });
});
