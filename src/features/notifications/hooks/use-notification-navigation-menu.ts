import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
    filterNotifications,
    NOTIFICATION_FILTER_DEFAULTS,
    type NotificationFilter,
} from "@/features/notifications/notification-filter";
import { useNotificationReadActions } from "@/features/notifications/hooks/use-notification-read-actions";
import { notificationsQueryOptions, type NotificationsData } from "@/features/notifications/services/queries";

export type NotificationNavigationItem = NotificationsData[number];

export const useNotificationNavigationMenu = () => {
    const { data: notifications } = useSuspenseQuery(notificationsQueryOptions());
    const { markAsRead, markAllAsRead, isMarkingAllRead } = useNotificationReadActions();
    const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>(
        NOTIFICATION_FILTER_DEFAULTS.filter,
    );
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter((notification) => notification.status === "unread").length;
    const unreadBadgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);
    const filteredNotifications = filterNotifications(notifications, notificationFilter);
    const previewNotifications = filteredNotifications.slice(0, 4);

    const setOpen = (open: boolean) => {
        setIsOpen(open);
        if (open) setNotificationFilter(NOTIFICATION_FILTER_DEFAULTS.filter);
    };

    const selectNotification = (notification: NotificationNavigationItem) => {
        if (notification.status === "unread") markAsRead(notification.id);
        setIsOpen(false);
    };

    const closeMenu = () => setIsOpen(false);

    return {
        closeMenu,
        isMarkingAllRead,
        isOpen,
        markAllAsRead,
        notificationFilter,
        notifications,
        previewNotifications,
        selectNotification,
        setNotificationFilter,
        setOpen,
        unreadBadgeLabel,
        unreadCount,
    };
};
