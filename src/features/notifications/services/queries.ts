import { queryOptions } from "@tanstack/react-query";

import { getNotificationsFn } from "@/features/notifications/services/fns";

export type NotificationsData = Awaited<ReturnType<typeof getNotificationsFn>>;

export const notificationsQueryOptions = () =>
    queryOptions({
        queryKey: ["notifications"],
        queryFn: getNotificationsFn,
    });
