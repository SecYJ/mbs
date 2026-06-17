import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { markAllNotificationsReadFn, markNotificationReadFn } from "@/features/notifications/services/fns";
import { notificationsQueryOptions, type NotificationsData } from "@/features/notifications/services/queries";

const readStatus = "read" as const;

const markNotificationRead = (notifications: NotificationsData | undefined, notificationId: string) =>
    notifications?.map((notification) =>
        notification.id === notificationId ? { ...notification, status: readStatus } : notification,
    );

const markAllNotificationsRead = (notifications: NotificationsData | undefined) =>
    notifications?.map((notification) =>
        notification.status === "unread" ? { ...notification, status: readStatus } : notification,
    );

export const useNotificationReadActions = () => {
    const queryClient = useQueryClient();
    const markNotificationReadServer = useServerFn(markNotificationReadFn);
    const markAllNotificationsReadServer = useServerFn(markAllNotificationsReadFn);

    const markNotificationReadMutation = useMutation({
        mutationFn: markNotificationReadServer,
        onMutate: async ({ data }) => {
            await queryClient.cancelQueries(notificationsQueryOptions());
            const previousNotifications = queryClient.getQueryData<NotificationsData>(
                notificationsQueryOptions().queryKey,
            );

            queryClient.setQueryData<NotificationsData>(notificationsQueryOptions().queryKey, (notifications) =>
                markNotificationRead(notifications, data.notificationId),
            );

            return { previousNotifications };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(notificationsQueryOptions().queryKey, context.previousNotifications);
            }
        },
        onSettled: async () => {
            await queryClient.invalidateQueries(notificationsQueryOptions());
        },
    });

    const markAllNotificationsReadMutation = useMutation({
        mutationFn: markAllNotificationsReadServer,
        onMutate: async () => {
            await queryClient.cancelQueries(notificationsQueryOptions());
            const previousNotifications = queryClient.getQueryData<NotificationsData>(
                notificationsQueryOptions().queryKey,
            );

            queryClient.setQueryData<NotificationsData>(notificationsQueryOptions().queryKey, markAllNotificationsRead);

            return { previousNotifications };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(notificationsQueryOptions().queryKey, context.previousNotifications);
            }
        },
        onSettled: async () => {
            await queryClient.invalidateQueries(notificationsQueryOptions());
        },
    });

    const markAsRead = (notificationId: string) => {
        markNotificationReadMutation.mutate({ data: { notificationId } });
    };

    const markAllAsRead = () => {
        markAllNotificationsReadMutation.mutate({ data: {} });
    };

    return {
        markAsRead,
        markAllAsRead,
        isMarkingRead: markNotificationReadMutation.isPending,
        isMarkingAllRead: markAllNotificationsReadMutation.isPending,
    };
};
