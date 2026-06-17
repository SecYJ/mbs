export const notificationFilters = ["all", "unread"] as const;

export type NotificationFilter = (typeof notificationFilters)[number];

export const NOTIFICATION_FILTER_DEFAULTS = {
    filter: "all" as NotificationFilter,
};

export const NOTIFICATION_FILTER_OPTIONS = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
] as const;

export const filterNotifications = <T extends { status: string }>(notifications: T[], filter: NotificationFilter) => {
    if (filter === "unread") return notifications.filter((notification) => notification.status === "unread");
    return notifications;
};
