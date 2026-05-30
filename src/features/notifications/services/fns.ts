import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { bookings, notifications, rooms } from "@/db/schema";
import { authenticatedUserMiddleware } from "@/middleware/auth";

const toIso = (value: Date | string | null) => (value ? new Date(value).toISOString() : new Date().toISOString());

export const getNotificationsFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .handler(async ({ context }) => {
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
            .where(eq(notifications.userId, context.session.user.id))
            .orderBy(desc(notifications.createdAt));

        return rows.map((row) => ({
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
    });

export const markNotificationReadFn = createServerFn({ method: "POST" })
    .middleware([authenticatedUserMiddleware])
    .inputValidator(
        z.object({
            notificationId: z.string().uuid(),
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
    .inputValidator(z.object({}))
    .handler(async ({ context }) => {
        const updatedNotifications = await db
            .update(notifications)
            .set({ status: "read" })
            .where(and(eq(notifications.userId, context.session.user.id), eq(notifications.status, "unread")))
            .returning({ id: notifications.notificationId });

        return { ids: updatedNotifications.map((notification) => notification.id) };
    });
