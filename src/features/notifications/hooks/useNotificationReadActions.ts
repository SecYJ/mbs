import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { markAllNotificationsReadFn, markNotificationReadFn } from "@/features/notifications/services/fns";
import { type NotificationFilter } from "@/features/notifications/schemas/notificationSchema";
import { notificationQueries, type NotificationsData } from "@/features/notifications/services/queries";
import { produce } from "immer";

export const useNotificationReadActions = (filter: NotificationFilter) => {
    const markNotificationReadServer = useServerFn(markNotificationReadFn);
    const markAllNotificationsReadServer = useServerFn(markAllNotificationsReadFn);

    const markNotificationReadMutation = useMutation({
        mutationFn: markNotificationReadServer,
        onMutate: async ({ data }, context) => {
            await context.client.cancelQueries(notificationQueries.list(filter));

            const previousNotifications = context.client.getQueryData(notificationQueries.list(filter).queryKey);

            if (previousNotifications) {
                context.client.setQueryData(
                    notificationQueries.list(filter).queryKey,
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
                    notificationQueries.list(filter).queryKey,
                    onMutateResult.previousNotifications,
                );
            }

            return context.client.invalidateQueries({ queryKey: notificationQueries.all() });
        },
    });

    const markAllNotificationsReadMutation = useMutation({
        mutationFn: markAllNotificationsReadServer,
        onMutate: async (_variables, context) => {
            await context.client.cancelQueries({ queryKey: notificationQueries.all() });

            const previousNotifications = context.client.getQueriesData<NotificationsData>({
                queryKey: notificationQueries.all(),
            });

            context.client.setQueriesData<NotificationsData>({ queryKey: notificationQueries.all() }, (data) =>
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

            return context.client.invalidateQueries({ queryKey: notificationQueries.all() });
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
