import { attendees, bookings, rooms, user } from "@mbs/shared/db/schema";
import { APP_TIME_ZONE } from "@mbs/shared/time";
import { and, count, desc, eq, gt, ilike, lte, or, sql } from "drizzle-orm";

import { db } from "#app/db/index";
import { getContainsPattern } from "#app/lib/like-pattern";
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
    const searchPattern = input.q ? getContainsPattern(input.q) : undefined;

    const attendeeCount = db
        .select({ value: count() })
        .from(attendees)
        .where(eq(attendees.bookingId, bookings.bookingId));

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
            attendees: sql<number>`(${attendeeCount})`.mapWith(Number),
        })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .innerJoin(user, eq(user.id, bookings.userId))
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
        .orderBy(desc(bookings.startTime));
}

export async function findAdminBookingRoomNames() {
    const [result] = await db
        .select({ names: sql<string[]>`coalesce(jsonb_agg(${rooms.name} order by ${rooms.name}), '[]'::jsonb)` })
        .from(rooms);

    return result.names;
}

const periodLengths = { day: sql`interval '1 day'`, week: sql`interval '1 week'` };

// The start and end of the current day or week on the office wall clock, as exact moments in time.
// date_trunc('week') starts on Monday. The length is added on the wall clock before converting back,
// so a daylight-saving change inside the period cannot shift the end.
function getLocalPeriodBounds(period: keyof typeof periodLengths, now: Date) {
    const localStart = sql`date_trunc(${period}::text, ${now}::timestamptz at time zone ${APP_TIME_ZONE}::text)`;

    return {
        start: sql`${localStart} at time zone ${APP_TIME_ZONE}::text`,
        end: sql`(${localStart} + ${periodLengths[period]}) at time zone ${APP_TIME_ZONE}::text`,
    };
}

export async function getAdminBookingCounts(now: Date) {
    const popularRoomQuery = db
        .select({ name: rooms.name })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .where(eq(bookings.status, "active"))
        .groupBy(rooms.name)
        .orderBy(desc(count()), rooms.name)
        .limit(1);

    const startsInPeriod = (period: keyof typeof periodLengths) => {
        const { start, end } = getLocalPeriodBounds(period, now);

        return sql<number>`count(*) filter (where ${bookings.startTime} >= ${start} and ${bookings.startTime} < ${end})`.mapWith(
            Number,
        );
    };

    const [stats] = await db
        .select({
            popularRoom: sql<string | null>`(${popularRoomQuery})`,
            todayCount: startsInPeriod("day"),
            weekCount: startsInPeriod("week"),
        })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .where(eq(bookings.status, "active"));

    return stats;
}
