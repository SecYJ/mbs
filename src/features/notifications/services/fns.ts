import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { bookings, notifications, rooms } from "@/db/schema";
import { notificationFilterSchema } from "@/features/notifications/schemas/notificationSchema";
import { authenticatedUserMiddleware } from "@/middleware/auth";

const toIso = (value: Date | string | null) => (value ? new Date(value).toISOString() : new Date().toISOString());

export const getNotificationsFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .validator(z.object({ filter: notificationFilterSchema.optional() }))
    .handler(async ({ context, data }) => {
        const userId = context.session.user.id;
        const statusFilter = data.filter === "unread" ? eq(notifications.status, "unread") : undefined;

        const rows = await db
            .select({
                notification: notifications,
                booking: {
                    id: bookings.bookingId,
                    title: bookings.title,
                    startTime: bookings.startTime,
                    endTime: bookings.endTime,
                },
                room: {
                    name: rooms.name,
                    location: rooms.location,
                },
            })
            .from(notifications)
            .innerJoin(bookings, eq(bookings.bookingId, notifications.bookingId))
            .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
            .where(and(eq(notifications.userId, userId), statusFilter))
            .orderBy(desc(notifications.createdAt));

        const [counts] = await db
            .select({
                totalCount: count(),
                unreadCount: sql<number>`count(*) filter (where ${notifications.status} = 'unread')`.mapWith(Number),
            })
            .from(notifications)
            .where(eq(notifications.userId, userId));

        const items = rows.map((row) => ({
            id: row.notification.notificationId,
            bookingId: row.notification.bookingId,
            message: row.notification.message,
            status: row.notification.status,
            createdAt: toIso(row.notification.createdAt),
            booking: {
                id: row.booking.id,
                title: row.booking.title,
                startTime: toIso(row.booking.startTime),
                endTime: toIso(row.booking.endTime),
            },
            room: row.room,
        }));

        return {
            items,
            totalCount: counts?.totalCount ?? 0,
            unreadCount: counts?.unreadCount ?? 0,
        };
    });

export const markNotificationReadFn = createServerFn({ method: "POST" })
    .middleware([authenticatedUserMiddleware])
    .validator(
        z.object({
            notificationId: z.uuid(),
        }),
    )
    .handler(async ({ context, data }) => {
        const [updatedNotification] = await db
            .update(notifications)
            .set({ status: "read" })
            .where(
                and(
                    eq(notifications.notificationId, data.notificationId),
                    eq(notifications.userId, context.session.user.id),
                    eq(notifications.status, "unread"),
                ),
            )
            .returning({ id: notifications.notificationId });

        return { id: updatedNotification?.id ?? data.notificationId };
    });

export const markAllNotificationsReadFn = createServerFn({ method: "POST" })
    .middleware([authenticatedUserMiddleware])
    .handler(async ({ context }) => {
        const updatedNotifications = await db
            .update(notifications)
            .set({ status: "read" })
            .where(and(eq(notifications.userId, context.session.user.id), eq(notifications.status, "unread")))
            .returning({ id: notifications.notificationId });

        return { ids: updatedNotifications.map((notification) => notification.id) };
    });
