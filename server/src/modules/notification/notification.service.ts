import { and, count, desc, eq, sql } from "drizzle-orm";

import { db } from "#app/db/index";
import { bookings, notifications, rooms } from "#app/db/schema";

const toIso = (value: Date | string | null) => (value ? new Date(value).toISOString() : new Date().toISOString());

export const getNotificationsService = async (userId: string, filter?: "unread") => {
    const notificationsRows = db
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
        .leftJoin(bookings, eq(bookings.bookingId, notifications.bookingId))
        .leftJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .where(and(eq(notifications.userId, userId), filter ? eq(notifications.status, filter) : undefined))
        .orderBy(desc(notifications.createdAt));

    const notificationCount = db
        .select({
            totalCount: count(),
            unreadCount: sql<number>`count(*) filter (where ${notifications.status} = 'unread')`.mapWith(Number),
        })
        .from(notifications)
        .where(eq(notifications.userId, userId));

    const [notificationList, [{ totalCount, unreadCount }]] = await Promise.all([notificationsRows, notificationCount]);

    const items = notificationList.map((row) => ({
        id: row.notification.notificationId,
        bookingId: row.notification.bookingId,
        message: row.notification.message,
        status: row.notification.status,
        createdAt: toIso(row.notification.createdAt),
        booking: row.booking
            ? {
                  id: row.booking.id,
                  title: row.booking.title,
                  startTime: toIso(row.booking.startTime),
                  endTime: toIso(row.booking.endTime),
              }
            : null,
        room: row.room,
    }));

    return {
        items,
        totalCount,
        unreadCount,
    };
};

export const markAllNotificationsAsReadService = async (userId: string) => {
    await db
        .update(notifications)
        .set({
            status: "read",
        })
        .where(and(eq(notifications.userId, userId), eq(notifications.status, "unread")));
};

export const markNotificationAsReadService = async (userId: string, notificationId: string) => {
    await db
        .update(notifications)
        .set({
            status: "read",
        })
        .where(
            and(
                eq(notifications.notificationId, notificationId),
                eq(notifications.userId, userId),
                eq(notifications.status, "unread"),
            ),
        );
};
