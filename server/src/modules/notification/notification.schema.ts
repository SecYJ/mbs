import { z } from "zod";

export const notificationFilterSchema = z.object({
    filter: z.literal("unread").optional().catch(undefined),
});

export const notificationIdSchema = z.object({
    notificationId: z.uuid(),
});
