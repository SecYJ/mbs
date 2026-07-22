import { z } from "zod";

export const notificationFilterSchema = z.enum(["all", "unread"]);

export type NotificationFilter = z.infer<typeof notificationFilterSchema>;
