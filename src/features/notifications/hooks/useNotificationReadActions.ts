import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { markAllNotificationsReadFn, markNotificationReadFn } from "@/features/notifications/services/fns";
import { notificationsQueryOptions, type NotificationsData } from "@/features/notifications/services/queries";
import { produce } from "immer";

export const useNotificationReadActions = () => {
    const markNotificationReadServer = useServerFn(markNotificationReadFn);
    const markAllNotificationsReadServer = useServerFn(markAllNotificationsReadFn);

    const markNotificationReadMutation = useMutation({
        mutationFn: markNotificationReadServer,
        onMutate: async ({ data }, context) => {
            await context.client.cancelQueries(notificationsQueryOptions());

            const previousNotifications = context.client.getQueryData(notificationsQueryOptions().queryKey);

            if (previousNotifications) {
                context.client.setQueryData(
                    notificationsQueryOptions().queryKey,
                    produce(previousNotifications, (draft) => {
                        draft.unreadCount -= 1;

                        const notification = draft.items.find((item) => {
                            return item.id === data.notificationId;
                        });

                        if (notification) {
                            notification.status = "read";
                        }
                    }),
                );
            }

            return { previousNotifications };
        },
        onSettled: (_data, error, _variables, onMutateResult, context) => {
            if (error && onMutateResult?.previousNotifications) {
                context.client.setQueryData<NotificationsData>(
                    notificationsQueryOptions().queryKey,
                    onMutateResult.previousNotifications,
                );
            }

            return context.client.invalidateQueries(notificationsQueryOptions());
        },
    });

    const markAllNotificationsReadMutation = useMutation({
        mutationFn: markAllNotificationsReadServer,
        onMutate: async (_variables, context) => {
            await context.client.cancelQueries(notificationsQueryOptions());

            const previousNotifications = context.client.getQueriesData<NotificationsData>(notificationsQueryOptions());

            context.client.setQueriesData<NotificationsData>(notificationsQueryOptions(), (data) =>
                data
                    ? produce(data, (draft) => {
                          draft.unreadCount = 0;

                          draft.items.forEach((notification) => {
                              notification.status = "read";
                          });
                      })
                    : data,
            );

            return { previousNotifications };
        },
        onSettled: (_data, error, _variables, onMutateResult, context) => {
            if (error && onMutateResult?.previousNotifications) {
                onMutateResult.previousNotifications.forEach(([queryKey, data]) => {
                    context.client.setQueryData(queryKey, data);
                });
            }

            return context.client.invalidateQueries(notificationsQueryOptions());
        },
    });

    const markAsRead = (notificationId: string) => {
        markNotificationReadMutation.mutate({ data: { notificationId } });
    };

    const markAllAsRead = () => markAllNotificationsReadMutation.mutate({ data: undefined });

    return {
        markAsRead,
        markAllAsRead,
        isMarkingRead: markNotificationReadMutation.isPending,
        isMarkingAllRead: markAllNotificationsReadMutation.isPending,
    };
};
