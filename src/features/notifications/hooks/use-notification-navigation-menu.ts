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

type NotificationNavigationMenuState = {
    filter: NotificationFilter;
} | null;

export const useNotificationNavigationMenu = () => {
    const { data: notifications } = useSuspenseQuery(notificationsQueryOptions());
    const { markAsRead, markAllAsRead, isMarkingAllRead } = useNotificationReadActions();
    const [menuState, setMenuState] = useState<NotificationNavigationMenuState>(null);
    const isOpen = menuState !== null;
    const notificationFilter = menuState?.filter ?? NOTIFICATION_FILTER_DEFAULTS.filter;

    const unreadCount = notifications.filter((notification) => notification.status === "unread").length;
    const unreadBadgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);
    const filteredNotifications = filterNotifications(notifications, notificationFilter);
    const previewNotifications = filteredNotifications.slice(0, 4);

    const setOpen = (open: boolean) => {
        setMenuState(open ? { filter: NOTIFICATION_FILTER_DEFAULTS.filter } : null);
    };

    const setNotificationFilter = (filter: NotificationFilter) => {
        setMenuState({ filter });
    };

    const selectNotification = (notification: NotificationNavigationItem) => {
        if (notification.status === "unread") markAsRead(notification.id);
        setMenuState(null);
    };

    const closeMenu = () => setMenuState(null);

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
