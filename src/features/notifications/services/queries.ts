import { queryOptions } from "@tanstack/react-query";

import { type NotificationFilter } from "@/features/notifications/schemas/notificationSchema";
import { getNotificationsFn } from "@/features/notifications/services/fns";

export type NotificationsData = Awaited<ReturnType<typeof getNotificationsFn>>;
export type NotificationItem = NotificationsData["items"][number];

export const notificationsQueryKey = ["notifications"] as const;

export const notificationsQueryOptions = (filter?: NotificationFilter) =>
    queryOptions({
        queryKey: [...notificationsQueryKey, filter ?? "all"],
        queryFn: () => getNotificationsFn({ data: { filter } }),
    });
