import {
    getNotificationCounts,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "#app/modules/notification/notification.repo";

export async function getNotificationsService(userId: string, filter?: "unread") {
    const [notifications, counts] = await Promise.all([
        getNotifications(userId, filter),
        getNotificationCounts(userId),
    ]);

    return {
        items: notifications.map((notification) => ({
            ...notification,
            // Keep the existing string response for legacy notifications without a creation date.
            createdAt: (notification.createdAt ?? new Date()).toISOString(),
            booking: notification.booking
                ? {
                      ...notification.booking,
                      startTime: notification.booking.startTime.toISOString(),
                      endTime: notification.booking.endTime.toISOString(),
                  }
                : null,
        })),
        ...counts,
    };
}

export async function markAllNotificationsAsReadService(userId: string) {
    await markAllNotificationsAsRead(userId);
}

export async function markNotificationAsReadService(userId: string, notificationId: string) {
    await markNotificationAsRead(userId, notificationId);
}
