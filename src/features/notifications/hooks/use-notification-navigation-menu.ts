import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import {
    filterNotifications,
    NOTIFICATION_FILTER_DEFAULTS,
    type NotificationFilter,
} from "@/features/notifications/notification-filter";
import { useNotificationReadActions } from "@/features/notifications/hooks/use-notification-read-actions";
import { notificationsQueryOptions, type NotificationsData } from "@/features/notifications/services/queries";

export type NotificationNavigationItem = NotificationsData[number];

const bookingsRoute = getRouteApi("/_bookings");

export const useNotificationNavigationMenu = () => {
    const { data: notifications } = useSuspenseQuery(notificationsQueryOptions());
    const { markAsRead, markAllAsRead, isMarkingAllRead } = useNotificationReadActions();
    const search = bookingsRoute.useSearch();
    const navigate = bookingsRoute.useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const notificationFilter = search.filter;

    const unreadCount = notifications.filter((notification) => notification.status === "unread").length;
    const unreadBadgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);
    const filteredNotifications = filterNotifications(notifications, notificationFilter);
    const previewNotifications = filteredNotifications.slice(0, 4);

    const setOpen = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            navigate({
                search: (prev) => ({ ...prev, filter: NOTIFICATION_FILTER_DEFAULTS.filter }),
                replace: true,
            });
        }
    };

    const setNotificationFilter = (filter: NotificationFilter) => {
        navigate({
            search: (prev) => ({ ...prev, filter }),
            replace: true,
        });
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
