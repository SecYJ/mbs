import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, gt, inArray, lte, or } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db/server";
import { attendees, bookings, rooms, user } from "@/db/schema";
import { getAttendeesByBooking } from "@/features/bookings/services/booking-attendees";
import { getBookingHistoryItem } from "@/features/bookings/services/booking-history";
import { authenticatedUserMiddleware } from "@/middleware/auth";
import { MY_BOOKING_GROUPS, type MyBookingGroupType } from "@/features/my-bookings/my-bookings.constants";

const getMyBookingGroupCondition = (group: MyBookingGroupType, now: Date) => {
    if (group === "upcoming") {
        return and(eq(bookings.status, "active"), gt(bookings.startTime, now));
    }

    if (group === "in-progress") {
        return and(eq(bookings.status, "active"), lte(bookings.startTime, now), gt(bookings.endTime, now));
    }

    return or(eq(bookings.status, "cancelled"), lte(bookings.endTime, now));
};

const matchesMyBookingQuery = (booking: ReturnType<typeof getBookingHistoryItem>, query: string) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;

    const haystack = [
        booking.title,
        booking.description,
        booking.room.name,
        booking.room.location,
        booking.organizer.name,
        booking.organizer.email,
        ...booking.attendees.flatMap((attendee) => [attendee.name, attendee.email]),
    ]
        .join(" ")
        .toLowerCase();

    return haystack.includes(normalized);
};

export const getMyBookingsDataFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .validator(
        z.object({
            group: z.enum(MY_BOOKING_GROUPS).optional(),
            q: z.string().optional(),
        }),
    )
    .handler(async ({ context, data }) => {
        const db = await getDb();
        const session = context.session;
        const now = new Date();

        const attendedBookingRows = await db
            .select({ bookingId: attendees.bookingId })
            .from(attendees)
            .where(eq(attendees.userId, session.user.id));
        const attendedBookingIds = attendedBookingRows.map((row) => row.bookingId);
        const historyOwnerCondition =
            attendedBookingIds.length > 0
                ? or(eq(bookings.userId, session.user.id), inArray(bookings.bookingId, attendedBookingIds))
                : eq(bookings.userId, session.user.id);

        const historyRows = await db
            .select({
                booking: bookings,
                room: {
                    name: rooms.name,
                    location: rooms.location,
                },
                organizer: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            })
            .from(bookings)
            .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
            .innerJoin(user, eq(user.id, bookings.userId))
            .where(and(historyOwnerCondition, data.group ? getMyBookingGroupCondition(data.group, now) : undefined))
            .orderBy(data.group === "past" ? desc(bookings.startTime) : asc(bookings.startTime));
        const historyBookingIds = historyRows.map((row) => row.booking.bookingId);
        const historyAttendeesByBooking = await getAttendeesByBooking(db, historyBookingIds);
        const cancelledByIds = Array.from(
            new Set(
                historyRows
                    .map((row) => row.booking.cancelledBy)
                    .filter((cancelledById): cancelledById is string => !!cancelledById),
            ),
        );
        const cancelledByRows =
            cancelledByIds.length === 0
                ? []
                : await db
                      .select({
                          id: user.id,
                          name: user.name,
                          email: user.email,
                      })
                      .from(user)
                      .where(inArray(user.id, cancelledByIds));
        const cancelledByUser = new Map(cancelledByRows.map((cancelledBy) => [cancelledBy.id, cancelledBy]));
        const history = historyRows.map((row) =>
            getBookingHistoryItem({
                booking: {
                    id: row.booking.bookingId,
                    roomId: row.booking.roomId,
                    title: row.booking.title,
                    description: row.booking.description,
                    startTime: row.booking.startTime,
                    endTime: row.booking.endTime,
                    status: row.booking.status,
                    cancelledAt: row.booking.cancelledAt,
                    cancelReason: row.booking.cancelReason,
                },
                room: row.room,
                organizer: row.organizer,
                cancelledBy: row.booking.cancelledBy ? (cancelledByUser.get(row.booking.cancelledBy) ?? null) : null,
                attendees: historyAttendeesByBooking.get(row.booking.bookingId) ?? [],
                currentUserId: session.user.id,
            }),
        );
        const query = data.q;

        return {
            currentUserId: session.user.id,
            currentUserRole: session.user.role,
            history: query ? history.filter((booking) => matchesMyBookingQuery(booking, query)) : history,
        };
    });

export const getMyBookingsStatsFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .handler(async ({ context }) => {
        const db = await getDb();
        const session = context.session;
        const now = new Date();

        const attendedBookingRows = await db
            .select({ bookingId: attendees.bookingId })
            .from(attendees)
            .where(eq(attendees.userId, session.user.id));
        const attendedBookingIds = attendedBookingRows.map((row) => row.bookingId);
        const historyOwnerCondition =
            attendedBookingIds.length > 0
                ? or(eq(bookings.userId, session.user.id), inArray(bookings.bookingId, attendedBookingIds))
                : eq(bookings.userId, session.user.id);

        const statsRows = await db
            .select({
                userId: bookings.userId,
                status: bookings.status,
                endTime: bookings.endTime,
            })
            .from(bookings)
            .where(historyOwnerCondition);
        const ownedCount = statsRows.filter((booking) => booking.userId === session.user.id).length;

        return {
            activeCount: statsRows.filter(
                (booking) => booking.status === "active" && new Date(booking.endTime).getTime() > now.getTime(),
            ).length,
            attendingCount: statsRows.length - ownedCount,
            ownedCount,
        };
    });
