import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { MY_BOOKING_GROUPS } from "@/features/my-bookings/my-bookings.constants";
import { getServerApiClient } from "@/lib/server-api-client";
import { authenticatedUserMiddleware } from "@/middleware/auth";

type MyBookingHistoryUser = {
    id: string;
    name: string;
    email: string;
    status?: "pending" | "accepted" | "declined";
};

type MyBookingHistoryItem = {
    id: string;
    roomId: string;
    title: string;
    description: string;
    start: string;
    end: string;
    status: "upcoming" | "in-progress" | "completed" | "cancelled";
    cancelledAt: string | null;
    cancelReason: string;
    room: {
        name: string;
        location: string;
    };
    organizer: MyBookingHistoryUser;
    cancelledBy: MyBookingHistoryUser | null;
    attendees: MyBookingHistoryUser[];
    currentUserAttendance: {
        status: "pending" | "accepted" | "declined";
    } | null;
};

type MyBookingsDataResponse = {
    currentUserId: string;
    history: MyBookingHistoryItem[];
};

export const getMyBookingsDataFn = createServerFn()
    .middleware([authenticatedUserMiddleware])
    .validator(
        z.object({
            group: z.enum(MY_BOOKING_GROUPS).optional(),
            q: z.string().optional(),
        }),
    )
    .handler(async ({ data }) => {
        const searchParams = {
            ...(data.group ? { group: data.group } : {}),
            ...(data.q ? { q: data.q } : {}),
        };

        return getServerApiClient().get("mybooking", { searchParams }).json<MyBookingsDataResponse>();
    });

export const getMyBookingsStatsFn = createServerFn()
    .middleware([authenticatedUserMiddleware])
    .handler(async () => {
        return getServerApiClient().get("mybooking/stats").json<{
            activeCount: number;
            attendingCount: number;
            ownedCount: number;
        }>();
    });
