import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

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
    const [visibleFilter, setVisibleFilter] = useState<NotificationFilter | null>(null);
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

    const closeMenu = () => setVisibleFilter(null);

    return {
        closeMenu,
        isMarkingAllRead,
        isOpen,
        markAllAsRead,
        notificationFilter,
        previewNotifications,
        selectNotification,
        setVisibleFilter,
        totalCount,
        unreadBadgeLabel,
        unreadCount,
    };
};
