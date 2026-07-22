import type { NotificationFilter } from "@/features/notifications/schemas/notificationSchema";

export const NOTIFICATION_DEFAULT_FILTER = {
    filter: "all" as NotificationFilter,
};

export const NOTIFICATION_FILTER_OPTIONS = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
] as const;
