import { attendees, bookings, rooms, user } from "@mbs/shared/db/schema";
import { and, asc, count, desc, eq, exists, gt, ilike, lte, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "#app/db/index";

type AttendeeStatus = "pending" | "accepted" | "declined";
type BookingHistoryStatus = "upcoming" | "in-progress" | "completed" | "cancelled";

type BookingHistoryUser = {
    id: string;
    name: string;
    email: string;
    status: AttendeeStatus;
};

type CurrentUserAttendance = Pick<BookingHistoryUser, "status">;

const attendeeUserTable = alias(user, "attendee_user");
const cancelledByUserTable = alias(user, "cancelled_by_user");
const searchAttendeeUserTable = alias(user, "search_attendee_user");

function getLikePattern(value: string) {
    const escapedValue = value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");

    return `%${escapedValue}%`;
}

function getUserBookingCondition(userId: string) {
    const currentUserAttendeeQuery = db
        .select({ value: sql`1` })
        .from(attendees)
        .where(and(eq(attendees.bookingId, bookings.bookingId), eq(attendees.userId, userId)));

    return or(eq(bookings.userId, userId), exists(currentUserAttendeeQuery));
}

export type MyBookingsInput = {
    userId: string;
    group?: "upcoming" | "in-progress" | "past";
    query?: string;
};

export async function findMyBookings({ userId, group, query }: MyBookingsInput) {
    const visibleAttendeesQuery = db
        .select({
            value: sql<BookingHistoryUser[]>`
                coalesce(
                    jsonb_agg(
                        jsonb_build_object(
                            'id', ${attendeeUserTable.id},
                            'name', ${attendeeUserTable.name},
                            'email', ${attendeeUserTable.email},
                            'status', ${attendees.status}
                        )
                    ),
                    '[]'::jsonb
                )
            `,
        })
        .from(attendees)
        .innerJoin(attendeeUserTable, eq(attendeeUserTable.id, attendees.userId))
        .where(and(eq(attendees.bookingId, bookings.bookingId), ne(attendees.userId, userId)));

    const currentUserAttendanceQuery = db
        .select({
            value: sql<CurrentUserAttendance>`jsonb_build_object('status', ${attendees.status})`,
        })
        .from(attendees)
        .where(and(eq(attendees.bookingId, bookings.bookingId), eq(attendees.userId, userId)))
        .limit(1);

    const dbNow = sql`now()`;

    const groupConditions = {
        upcoming: and(eq(bookings.status, "active"), gt(bookings.startTime, dbNow)),
        "in-progress": and(eq(bookings.status, "active"), lte(bookings.startTime, dbNow), gt(bookings.endTime, dbNow)),
        past: or(eq(bookings.status, "cancelled"), lte(bookings.endTime, dbNow)),
    };

    const normalizedQuery = query?.trim();
    const searchPattern = normalizedQuery ? getLikePattern(normalizedQuery) : undefined;
    const searchCondition = searchPattern
        ? or(
              ilike(bookings.title, searchPattern),
              ilike(bookings.description, searchPattern),
              ilike(rooms.name, searchPattern),
              ilike(rooms.location, searchPattern),
              ilike(user.name, searchPattern),
              ilike(user.email, searchPattern),
              exists(
                  db
                      .select({ value: sql`1` })
                      .from(attendees)
                      .innerJoin(searchAttendeeUserTable, eq(searchAttendeeUserTable.id, attendees.userId))
                      .where(
                          and(
                              eq(attendees.bookingId, bookings.bookingId),
                              ne(attendees.userId, userId),
                              or(
                                  ilike(searchAttendeeUserTable.name, searchPattern),
                                  ilike(searchAttendeeUserTable.email, searchPattern),
                              ),
                          ),
                      ),
              ),
          )
        : undefined;

    return db
        .select({
            id: bookings.bookingId,
            roomId: bookings.roomId,
            title: bookings.title,
            description: sql<string>`coalesce(${bookings.description}, '')`,
            start: bookings.startTime,
            end: bookings.endTime,
            status: sql<BookingHistoryStatus>`
                case
                    when ${bookings.status} = ${"cancelled"} then 'cancelled'
                    when ${bookings.endTime} <= ${dbNow} then 'completed'
                    when ${bookings.startTime} <= ${dbNow} then 'in-progress'
                    else 'upcoming'
                end
            `,
            cancelledAt: bookings.cancelledAt,
            cancelReason: sql<string>`coalesce(${bookings.cancelReason}, '')`,
            room: {
                name: rooms.name,
                location: rooms.location,
            },
            organizer: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            cancelledBy: {
                id: cancelledByUserTable.id,
                name: cancelledByUserTable.name,
                email: cancelledByUserTable.email,
            },
            attendees: sql<BookingHistoryUser[]>`(${visibleAttendeesQuery})`,
            currentUserAttendance: sql<CurrentUserAttendance | null>`(${currentUserAttendanceQuery})`,
        })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .innerJoin(user, eq(user.id, bookings.userId))
        .leftJoin(cancelledByUserTable, eq(cancelledByUserTable.id, bookings.cancelledBy))
        .where(and(getUserBookingCondition(userId), group ? groupConditions[group] : undefined, searchCondition))
        .orderBy(group === "past" ? desc(bookings.startTime) : asc(bookings.startTime));
}

export async function getMyBookingCounts(userId: string) {
    const [counts] = await db
        .select({
            activeBookingCount: sql<number>`count(*) filter (
                where ${and(eq(bookings.status, "active"), gt(bookings.endTime, sql`now()`))}
            )`.mapWith(Number),
            ownedCount: sql<number>`
                count(*) filter (
                    where ${bookings.userId} = ${userId}
                )
            `.mapWith(Number),
            totalCount: count(),
        })
        .from(bookings)
        .where(getUserBookingCondition(userId));

    return counts;
}
