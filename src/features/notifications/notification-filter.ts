export type NotificationFilter = "all" | "unread";

export const notificationFilterDefaults = {
    filter: "all" as NotificationFilter,
};

export const notificationFilterOptions = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
] as const;

export const filterNotifications = <T extends { status: string }>(notifications: T[], filter: NotificationFilter) => {
    if (filter === "unread") return notifications.filter((notification) => notification.status === "unread");
    return notifications;
};
