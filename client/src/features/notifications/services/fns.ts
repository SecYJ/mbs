import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { notificationFilterSchema } from "@/features/notifications/schemas/notificationSchema";
import { getServerApiClient } from "@/lib/server-api-client";

type NotificationsResponse = {
    items: Array<{
        id: string;
        bookingId: string | null;
        message: string;
        status: "read" | "unread" | "pending";
        createdAt: string;
        booking: {
            id: string;
            title: string;
            startTime: string;
            endTime: string;
        } | null;
        room: {
            name: string;
            location: string;
        } | null;
    }>;
    totalCount: number;
    unreadCount: number;
};

export const getNotificationsFn = createServerFn({ method: "GET" })
    .validator(z.object({ filter: notificationFilterSchema.optional() }))
    .handler(async ({ data }) => {
        const searchParams = data.filter === "unread" ? { filter: data.filter } : undefined;

        return getServerApiClient().get("notifications", { searchParams }).json<NotificationsResponse>();
    });

export const markNotificationReadFn = createServerFn({ method: "POST" })
    .validator(
        z.object({
            notificationId: z.uuid(),
        }),
    )
    .handler(async ({ data }) => {
        await getServerApiClient().patch(`notifications/${data.notificationId}`);
    });

export const markAllNotificationsReadFn = createServerFn({ method: "POST" }).handler(async () => {
    await getServerApiClient().patch("notifications");
});
