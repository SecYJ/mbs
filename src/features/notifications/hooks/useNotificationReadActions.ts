import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { markAllNotificationsReadFn, markNotificationReadFn } from "@/features/notifications/services/fns";
import { type NotificationFilter } from "@/features/notifications/schemas/notificationSchema";
import {
    notificationsQueryKey,
    notificationsQueryOptions,
    type NotificationsData,
} from "@/features/notifications/services/queries";
import { produce } from "immer";

export const useNotificationReadActions = (filter: NotificationFilter) => {
    const markNotificationReadServer = useServerFn(markNotificationReadFn);
    const markAllNotificationsReadServer = useServerFn(markAllNotificationsReadFn);

    const markNotificationReadMutation = useMutation({
        mutationFn: markNotificationReadServer,
        onMutate: async ({ data }, context) => {
            await context.client.cancelQueries(notificationsQueryOptions(filter));

            const previousNotifications = context.client.getQueryData(notificationsQueryOptions(filter).queryKey);

            if (previousNotifications) {
                context.client.setQueryData(
                    notificationsQueryOptions(filter).queryKey,
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
                    notificationsQueryOptions(filter).queryKey,
                    onMutateResult.previousNotifications,
                );
            }

            return context.client.invalidateQueries({ queryKey: notificationsQueryKey });
        },
    });

    const markAllNotificationsReadMutation = useMutation({
        mutationFn: markAllNotificationsReadServer,
        onMutate: async (_variables, context) => {
            await context.client.cancelQueries({ queryKey: notificationsQueryKey });

            const previousNotifications = context.client.getQueriesData<NotificationsData>({
                queryKey: notificationsQueryKey,
            });

            context.client.setQueriesData<NotificationsData>({ queryKey: notificationsQueryKey }, (data) =>
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

            return context.client.invalidateQueries({ queryKey: notificationsQueryKey });
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
