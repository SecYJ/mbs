import { attendees, bookings, rooms, user } from "@mbs/shared/db/schema";
import { and, count, desc, eq, gt, gte, ilike, lt, lte, or, sql } from "drizzle-orm";

import { db } from "#app/db/index";
import type { AdminBookingsFilter } from "#app/modules/admin-booking/admin-booking.schema";

function getStatusCondition(status: AdminBookingsFilter["status"], now: Date) {
    if (status === "cancelled") return eq(bookings.status, "cancelled");
    if (status === "completed") return and(eq(bookings.status, "active"), lte(bookings.endTime, now));
    if (status === "in-progress") {
        return and(eq(bookings.status, "active"), lte(bookings.startTime, now), gt(bookings.endTime, now));
    }
    if (status === "upcoming") return and(eq(bookings.status, "active"), gt(bookings.startTime, now));

    return undefined;
}

export async function findAdminBookings(input: AdminBookingsFilter, now: Date) {
    const searchPattern = input.q ? `%${input.q}%` : undefined;

    return db
        .select({
            id: bookings.bookingId,
            title: bookings.title,
            startTime: bookings.startTime,
            endTime: bookings.endTime,
            status: bookings.status,
            room: rooms.name,
            bookedBy: user.name,
            userId: bookings.userId,
            attendees: count(attendees.userId),
        })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .innerJoin(user, eq(user.id, bookings.userId))
        .leftJoin(attendees, eq(attendees.bookingId, bookings.bookingId))
        .where(
            and(
                getStatusCondition(input.status, now),
                searchPattern
                    ? or(
                          ilike(bookings.title, searchPattern),
                          ilike(rooms.name, searchPattern),
                          ilike(user.name, searchPattern),
                      )
                    : undefined,
                input.room !== "all" ? eq(rooms.name, input.room) : undefined,
            ),
        )
        .groupBy(
            bookings.bookingId,
            bookings.title,
            bookings.startTime,
            bookings.endTime,
            bookings.status,
            rooms.name,
            user.name,
            bookings.userId,
        )
        .orderBy(desc(bookings.startTime));
}

export async function findAdminBookingRoomNames() {
    const [result] = await db
        .select({ names: sql<string[]>`coalesce(jsonb_agg(${rooms.name} order by ${rooms.name}), '[]'::jsonb)` })
        .from(rooms);

    return result.names;
}

export async function getAdminBookingCounts(todayStart: Date, tomorrowStart: Date, weekStart: Date, weekEnd: Date) {
    const popularRoomQuery = db
        .select({ name: rooms.name })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .where(eq(bookings.status, "active"))
        .groupBy(rooms.name)
        .orderBy(desc(count()), rooms.name)
        .limit(1);

    const [stats] = await db
        .select({
            popularRoom: sql<string | null>`(${popularRoomQuery})`,
            todayCount: sql<number>`count(*) filter (
                where ${and(gte(bookings.startTime, todayStart), lt(bookings.startTime, tomorrowStart))}
            )`.mapWith(Number),
            weekCount: sql<number>`count(*) filter (
                where ${and(gte(bookings.startTime, weekStart), lt(bookings.startTime, weekEnd))}
            )`.mapWith(Number),
        })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .where(eq(bookings.status, "active"));

    return stats;
}
