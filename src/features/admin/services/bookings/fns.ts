import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, gt, ilike, lte, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { attendees, bookings, notifications, rooms, user } from "@/db/schema";
import { cancelBookingSchema } from "@/features/bookings/schemas/booking.schema";
import { getBookingCancellationNotificationValues } from "@/features/bookings/services/booking-notifications";
import { requireAdminUser } from "@/lib/session";

const adminBookingsFilterSchema = z.object({
    q: z.string().trim().catch(""),
    room: z.string().catch("all"),
    status: z.enum(["all", "upcoming", "in-progress", "completed", "cancelled"]).catch("all"),
});

const toIso = (value: Date | string) => new Date(value).toISOString();

const getStatusCondition = (status: z.infer<typeof adminBookingsFilterSchema>["status"], now: Date) => {
    if (status === "cancelled") return eq(bookings.status, "cancelled");
    if (status === "completed") return and(eq(bookings.status, "active"), lte(bookings.endTime, now));
    if (status === "in-progress") {
        return and(eq(bookings.status, "active"), lte(bookings.startTime, now), gt(bookings.endTime, now));
    }
    if (status === "upcoming") return and(eq(bookings.status, "active"), gt(bookings.startTime, now));

    return undefined;
};

export const getAdminBookingsFn = createServerFn({ method: "GET" })
    .inputValidator(adminBookingsFilterSchema)
    .handler(async ({ data }) => {
        await requireAdminUser();

        const now = new Date();
        const search = data.q;
        const whereConditions = [getStatusCondition(data.status, now)];

        if (search) {
            const pattern = `%${search}%`;
            whereConditions.push(
                or(ilike(bookings.title, pattern), ilike(rooms.name, pattern), ilike(user.name, pattern)),
            );
        }

        if (data.room !== "all") {
            whereConditions.push(eq(rooms.name, data.room));
        }

        const rows = await db
            .select({
                id: bookings.bookingId,
                title: bookings.title,
                startTime: bookings.startTime,
                endTime: bookings.endTime,
                status: bookings.status,
                room: rooms.name,
                bookedBy: user.name,
                attendees: sql<number>`count(${attendees.userId})::int`,
            })
            .from(bookings)
            .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
            .innerJoin(user, eq(user.id, bookings.userId))
            .leftJoin(attendees, eq(attendees.bookingId, bookings.bookingId))
            .where(and(...whereConditions.filter((condition) => condition !== undefined)))
            .groupBy(
                bookings.bookingId,
                bookings.title,
                bookings.startTime,
                bookings.endTime,
                bookings.status,
                rooms.name,
                user.name,
            )
            .orderBy(desc(bookings.startTime));

        const roomRows = await db.select({ name: rooms.name }).from(rooms).orderBy(rooms.name);

        return {
            bookings: rows.map((row) => ({
                ...row,
                startTime: toIso(row.startTime),
                endTime: toIso(row.endTime),
                attendees: Number(row.attendees),
            })),
            rooms: roomRows.map((room) => room.name),
        };
    });

export const getAdminBookingStatsFn = createServerFn({ method: "GET" }).handler(async () => {
    await requireAdminUser();

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const weekStart = new Date(todayStart);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const activeRows = await db
        .select({ room: rooms.name, startTime: bookings.startTime })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .where(eq(bookings.status, "active"));

    const roomCounts: Record<string, number> = {};
    let todayCount = 0;
    let weekCount = 0;

    for (const booking of activeRows) {
        const startTime = new Date(booking.startTime);
        if (todayStart <= startTime && startTime < tomorrowStart) todayCount += 1;
        if (weekStart <= startTime && startTime < weekEnd) weekCount += 1;
        roomCounts[booking.room] = (roomCounts[booking.room] || 0) + 1;
    }

    return {
        popularRoom: Object.entries(roomCounts).toSorted((a, b) => b[1] - a[1])[0]?.[0] ?? null,
        todayCount,
        weekCount,
    };
});

export const cancelAdminBookingFn = createServerFn({ method: "POST" })
    .inputValidator(cancelBookingSchema)
    .handler(async ({ data }) => {
        const session = await requireAdminUser();
        const [booking] = await db
            .select({
                id: bookings.bookingId,
                status: bookings.status,
                endTime: bookings.endTime,
                startTime: bookings.startTime,
                title: bookings.title,
                userId: bookings.userId,
                roomName: rooms.name,
                roomLocation: rooms.location,
            })
            .from(bookings)
            .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
            .where(eq(bookings.bookingId, data.bookingId))
            .limit(1);

        if (!booking) {
            throw new Error("Booking no longer exists");
        }

        if (booking.status === "cancelled") {
            throw new Error("Booking is already cancelled");
        }

        if (new Date(booking.endTime).getTime() <= Date.now()) {
            throw new Error("Past bookings cannot be cancelled");
        }

        const attendeeRows = await db
            .select({ userId: attendees.userId })
            .from(attendees)
            .where(eq(attendees.bookingId, data.bookingId));
        const attendeeIds = attendeeRows.map((attendee) => attendee.userId);
        const recipientIds = [...new Set([...attendeeIds, booking.userId])];
        const cancelledAt = new Date();

        await db.transaction(async (tx) => {
            const updated = await tx
                .update(bookings)
                .set({
                    status: "cancelled",
                    cancelledAt,
                    cancelledBy: session.user.id,
                    cancelReason: data.cancelReason || null,
                    updatedAt: cancelledAt,
                })
                .where(and(eq(bookings.bookingId, data.bookingId), eq(bookings.status, "active")))
                .returning({ id: bookings.bookingId });

            if (updated.length === 0) {
                throw new Error("Failed to cancel booking");
            }

            if (recipientIds.length > 0) {
                await tx.insert(notifications).values(
                    getBookingCancellationNotificationValues({
                        attendeeIds: recipientIds,
                        booking: {
                            id: booking.id,
                            title: booking.title,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            roomName: booking.roomName,
                            roomLocation: booking.roomLocation,
                        },
                    }),
                );
            }
        });

        return { id: data.bookingId };
    });
