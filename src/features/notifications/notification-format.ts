export const formatNotificationDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

export const formatNotificationTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

export const formatNotificationDateTime = (value: string) =>
    `${formatNotificationDate(value)} at ${formatNotificationTime(value)}`;
