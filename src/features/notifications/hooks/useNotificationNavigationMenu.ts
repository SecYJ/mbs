import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useTransition } from "react";

import { useNotificationReadActions } from "@/features/notifications/hooks/useNotificationReadActions";
import { type NotificationFilter } from "@/features/notifications/schemas/notificationSchema";
import {
    notificationsQueryOptions,
    type NotificationItem,
    type NotificationsData,
} from "@/features/notifications/services/queries";
import { NOTIFICATION_DEFAULT_FILTER } from "@/features/notifications/constants/notificationConstants";

const NOTIFICATION_PREVIEW_LIMIT = 4;

const selectNotificationMenu = (data: NotificationsData) => ({
    totalCount: data.totalCount,
    unreadCount: data.unreadCount,
    previewNotifications: data.items.slice(0, NOTIFICATION_PREVIEW_LIMIT),
});

export const useNotificationNavigationMenu = () => {
    const queryClient = useQueryClient();
    const [visibleFilter, setVisibleFilter] = useState<NotificationFilter | null>(null);
    const [isPending, startTransition] = useTransition();
    const isOpen = visibleFilter !== null;
    const notificationFilter = visibleFilter ?? NOTIFICATION_DEFAULT_FILTER.filter;

    const {
        data: { totalCount, unreadCount, previewNotifications },
    } = useSuspenseQuery({
        ...notificationsQueryOptions(notificationFilter),
        select: selectNotificationMenu,
    });
    const { markAsRead, markAllAsRead, isMarkingAllRead } = useNotificationReadActions(notificationFilter);

    const unreadBadgeLabel = unreadCount > 99 ? "99+" : unreadCount.toString();

    const selectNotification = (notification: NotificationItem) => {
        if (notification.status === "unread") markAsRead(notification.id);
        setVisibleFilter(null);
    };

    const prefetchNotifications = (filter: NotificationFilter) => {
        void queryClient.ensureQueryData(notificationsQueryOptions(filter));
    };

    const closeMenu = () => setVisibleFilter(null);
    const setNotificationFilter = (filter: NotificationFilter) => {
        startTransition(() => setVisibleFilter(filter));
    };

    return {
        closeMenu,
        isMarkingAllRead,
        isOpen,
        isPending,
        markAllAsRead,
        notificationFilter,
        previewNotifications,
        prefetchNotifications,
        selectNotification,
        setNotificationFilter,
        setVisibleFilter,
        totalCount,
        unreadBadgeLabel,
        unreadCount,
    };
};
