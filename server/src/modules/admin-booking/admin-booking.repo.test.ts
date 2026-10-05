import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "#app/db/index";
import {
    findAdminBookingRoomNames,
    findAdminBookings,
    getAdminBookingCounts,
} from "#app/modules/admin-booking/admin-booking.repo";
import { getAdminUsersService } from "#app/modules/admin-user/admin-user.service";

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

const now = new Date("2026-09-20T12:30:00Z");

describe.skipIf(!process.env.TEST_DATABASE_URL)("admin queries against PostgreSQL", () => {
    beforeAll(async () => {
        // Keep all queries on one connection using temporary tables, never application tables.
        await db.$client.query(`
            SET search_path TO pg_temp;
            CREATE TEMP TABLE "user" (
                id text PRIMARY KEY, name text NOT NULL, email text NOT NULL, image text,
                role text NOT NULL, created_at timestamptz NOT NULL
            );
            CREATE TEMP TABLE session (user_id text NOT NULL, created_at timestamptz NOT NULL);
            CREATE TEMP TABLE rooms (room_id uuid PRIMARY KEY, name text NOT NULL);
            CREATE TEMP TABLE bookings (
                booking_id uuid PRIMARY KEY, room_id uuid NOT NULL, user_id text NOT NULL,
                start_time timestamptz NOT NULL, end_time timestamptz NOT NULL, title text NOT NULL, status text NOT NULL
            );
            CREATE TEMP TABLE attendees (booking_id uuid NOT NULL, user_id text NOT NULL);
        `);
    });

    afterAll(async () => {
        await db.$client.end();
    });

    beforeEach(async () => {
        await db.$client.query(`
            TRUNCATE pg_temp.attendees, pg_temp.bookings, pg_temp.rooms, pg_temp.session, pg_temp."user";
            INSERT INTO "user" (id, name, email, role, created_at) VALUES
                ('owner', 'Owner', 'owner@example.test', 'admin', '2026-09-01T10:00:00Z'),
                ('guest', 'Guest 50%_\\', 'guest@example.test', 'user', '2026-09-02T10:00:00Z');
            INSERT INTO session (user_id, created_at) VALUES
                ('owner', '2026-09-18T10:00:00Z'), ('owner', '2026-09-19T10:00:00Z');
            INSERT INTO rooms (room_id, name) VALUES
                ('00000000-0000-0000-0000-000000000100', 'Alpha'),
                ('00000000-0000-0000-0000-000000000101', 'Beta');
            INSERT INTO bookings (booking_id, room_id, user_id, start_time, end_time, title, status)
            SELECT id::uuid, room::uuid, 'owner', starts::timestamptz,
                starts::timestamptz + interval '1 hour', title, status
            FROM (VALUES
                ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000100', '2026-09-20T00:00:00Z', 'Today midnight', 'active'),
                ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000101', '2026-09-20T12:00:00Z', 'Running meeting', 'active'),
                ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000100', '2026-09-14T00:00:00Z', 'Week midnight', 'active'),
                ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000101', '2026-09-21T00:00:00Z', 'Next week', 'active'),
                ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000100', '2026-09-19T12:00:00Z', 'Cancelled', 'cancelled'),
                ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000100', '2026-09-13T23:59:00Z', 'Previous week', 'active')
            ) AS fixture(id, room, starts, title, status);
            INSERT INTO attendees (booking_id, user_id) VALUES
                ('00000000-0000-0000-0000-000000000001', 'owner'),
                ('00000000-0000-0000-0000-000000000001', 'guest');
        `);
    });

    it("returns descending bookings, counts attendees once, and lists ordered room names", async () => {
        const result = await findAdminBookings({ q: "", room: "all", status: "all" }, now);

        expect(result.map((booking) => booking.id)).toEqual([4, 2, 1, 5, 3, 6].map(uuid));
        expect(result.find((booking) => booking.id === uuid(1))).toMatchObject({
            attendees: 2,
            room: "Alpha",
            bookedBy: "Owner",
        });
        expect(result.find((booking) => booking.id === uuid(2))).toMatchObject({ attendees: 0 });
        expect(await findAdminBookingRoomNames()).toEqual(["Alpha", "Beta"]);
    });

    it.each([
        ["upcoming", [4]],
        ["in-progress", [2]],
        ["completed", [1, 3, 6]],
        ["cancelled", [5]],
    ] as const)("filters %s without mixing cancelled and active bookings", async (status, ids) => {
        const result = await findAdminBookings({ q: "", room: "all", status }, now);

        expect(result.map((booking) => booking.id)).toEqual(ids.map(uuid));
    });

    it("combines room, status, and title/organizer/room searches in SQL", async () => {
        for (const q of ["night", "oWNeR", "Alpha"]) {
            const result = await findAdminBookings({ q, room: "Alpha", status: "completed" }, now);
            expect(result.map((booking) => booking.id)).toEqual((q === "night" ? [1, 3] : [1, 3, 6]).map(uuid));
        }
        expect(await findAdminBookings({ q: "missing", room: "all", status: "all" }, now)).toEqual([]);
    });

    it("aggregates active bookings with inclusive starts and exclusive day/week ends", async () => {
        const result = await getAdminBookingCounts(
            new Date("2026-09-20T00:00:00Z"),
            new Date("2026-09-21T00:00:00Z"),
            new Date("2026-09-14T00:00:00Z"),
            new Date("2026-09-21T00:00:00Z"),
        );

        expect(result).toEqual({ popularRoom: "Alpha", todayCount: 2, weekCount: 3 });
    });

    it("returns empty room/bookings arrays and null/zero stats with no records", async () => {
        await db.$client.query("TRUNCATE pg_temp.attendees, pg_temp.bookings, pg_temp.rooms");

        expect(await findAdminBookings({ q: "", room: "all", status: "all" }, now)).toEqual([]);
        expect(await findAdminBookingRoomNames()).toEqual([]);
        expect(await getAdminBookingCounts(now, now, now, now)).toEqual({
            popularRoom: null,
            todayCount: 0,
            weekCount: 0,
        });
    });

    it("returns each user once with their latest session and serialized nullable fields", async () => {
        const result = await getAdminUsersService({ sort: "name", dir: "asc" });

        expect(result).toEqual([
            {
                id: "guest",
                name: "Guest 50%_\\",
                email: "guest@example.test",
                role: "user",
                image: null,
                createdAt: "2026-09-02T10:00:00.000Z",
                lastLoginAt: null,
            },
            {
                id: "owner",
                name: "Owner",
                email: "owner@example.test",
                role: "admin",
                image: null,
                createdAt: "2026-09-01T10:00:00.000Z",
                lastLoginAt: "2026-09-19T10:00:00.000Z",
            },
        ]);
    });

    it("searches literal wildcard characters and sorts absent last login as the epoch", async () => {
        for (const q of ["%", "_", "\\", "gUEst", "guest@example.test"]) {
            const result = await getAdminUsersService({ q, sort: "name", dir: "asc" });
            expect(result.map((user) => user.id)).toEqual(["guest"]);
        }
        const ascending = await getAdminUsersService({ sort: "lastLogin", dir: "asc" });
        const descending = await getAdminUsersService({ sort: "lastLogin", dir: "desc" });
        expect(ascending.map((user) => user.id)).toEqual(["guest", "owner"]);
        expect(descending.map((user) => user.id)).toEqual(["owner", "guest"]);
        expect(await getAdminUsersService({ q: "nobody", sort: "name", dir: "asc" })).toEqual([]);
    });
});
