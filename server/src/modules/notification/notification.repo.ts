import { bookings, notifications, rooms } from "@mbs/shared/db/schema";
import { and, count, desc, eq, sql } from "drizzle-orm";

import { db } from "#app/db/index";

// The bell menu only shows recent items; the counts below still cover every notification.
const NOTIFICATION_LIST_LIMIT = 100;

export async function getNotifications(userId: string, filter?: "unread") {
    return db
        .select({
            id: notifications.notificationId,
            bookingId: notifications.bookingId,
            message: notifications.message,
            status: notifications.status,
            createdAt: notifications.createdAt,
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
        .orderBy(desc(notifications.createdAt))
        .limit(NOTIFICATION_LIST_LIMIT);
}

export async function getNotificationCounts(userId: string) {
    const [counts] = await db
        .select({
            totalCount: count(),
            unreadCount: sql<number>`count(*) filter (where ${notifications.status} = 'unread')`.mapWith(Number),
        })
        .from(notifications)
        .where(eq(notifications.userId, userId));

    return counts;
}

export async function markAllNotificationsAsRead(userId: string) {
    await db
        .update(notifications)
        .set({ status: "read" })
        .where(and(eq(notifications.userId, userId), eq(notifications.status, "unread")));
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
    await db
        .update(notifications)
        .set({ status: "read" })
        .where(
            and(
                eq(notifications.notificationId, notificationId),
                eq(notifications.userId, userId),
                eq(notifications.status, "unread"),
            ),
        );
}
