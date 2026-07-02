import { queryOptions } from "@tanstack/react-query";

import { type NotificationFilter } from "@/features/notifications/schemas/notificationSchema";
import { getNotificationsFn } from "@/features/notifications/services/fns";

export type NotificationsData = Awaited<ReturnType<typeof getNotificationsFn>>;
export type NotificationItem = NotificationsData["items"][number];

export const notificationQueries = {
    all: () => ["notifications"],
    list: (filter?: NotificationFilter) => {
        return queryOptions({
            queryKey: [...notificationQueries.all(), filter ?? "all"],
            queryFn: () => getNotificationsFn({ data: { filter } }),
        });
    },
};
