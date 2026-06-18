import { format } from "date-fns";

export const formatNotificationDate = (value: string) => format(new Date(value), "MMM d, yyyy");

export const formatNotificationTime = (value: string) => format(new Date(value), "h:mm a");

export const formatNotificationDateTime = (value: string) => format(new Date(value), "MMM d, yyyy 'at' h:mm a");
