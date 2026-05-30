import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
    filterNotifications,
    type NotificationFilter,
    notificationFilterDefaults,
} from "@/features/notifications/notification-filter";
import { useNotificationReadActions } from "@/features/notifications/hooks/use-notification-read-actions";
import { notificationsQueryOptions, type NotificationsData } from "@/features/notifications/services/queries";
import { playNotificationSound } from "@/features/settings/notification-sound";
import { useUserPreferences } from "@/features/settings/user-preferences";

export type NotificationNavigationItem = NotificationsData[number];

const getUnreadNotificationIds = (notifications: NotificationsData) =>
    new Set(
        notifications.filter((notification) => notification.status === "unread").map((notification) => notification.id),
    );

export const useNotificationNavigationMenu = () => {
    const { data: notifications = [], isFetched: hasFetchedNotifications } = useQuery(notificationsQueryOptions());
    const { markAsRead, markAllAsRead, isMarkingAllRead } = useNotificationReadActions();
    const { preferences } = useUserPreferences();
    const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>(notificationFilterDefaults.filter);
    const [isOpen, setIsOpen] = useState(false);
    const previousUnreadIdsRef = useRef<Set<string> | null>(null);

    const unreadCount = notifications.filter((notification) => notification.status === "unread").length;
    const unreadBadgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);
    const filteredNotifications = filterNotifications(notifications, notificationFilter);
    const previewNotifications = filteredNotifications.slice(0, 4);

    useEffect(() => {
        if (!hasFetchedNotifications) return;

        const unreadIds = getUnreadNotificationIds(notifications);

        if (!previousUnreadIdsRef.current) {
            previousUnreadIdsRef.current = unreadIds;
            return;
        }

        const hasNewUnreadNotification = [...unreadIds].some(
            (notificationId) => !previousUnreadIdsRef.current?.has(notificationId),
        );

        if (hasNewUnreadNotification && preferences.notifications.soundEnabled) {
            void playNotificationSound();
        }

        previousUnreadIdsRef.current = unreadIds;
    }, [hasFetchedNotifications, notifications, preferences.notifications.soundEnabled]);

    const setOpen = (open: boolean) => {
        setIsOpen(open);
        if (open) setNotificationFilter(notificationFilterDefaults.filter);
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
