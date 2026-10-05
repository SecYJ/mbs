import type { UserRole } from "@mbs/shared/roles";
import { createServerFn } from "@tanstack/react-start";

import { adminBookingsSearchSchema } from "@/features/admin/schema/bookings-search.schema";
import { cancelBookingSchema } from "@/features/bookings/schemas/booking.schema";
import { getServerApiClient } from "@/lib/server-api-client";
import { adminUserMiddleware } from "@/middleware/auth";

type AdminBookingsResponse = {
    currentUserId: string;
    currentUserRole: UserRole;
    bookings: {
        id: string;
        title: string;
        startTime: string;
        endTime: string;
        status: "active" | "cancelled";
        room: string;
        bookedBy: string;
        userId: string;
        attendees: number;
    }[];
    rooms: string[];
};

export const getAdminBookingsFn = createServerFn({ method: "GET" })
    .middleware([adminUserMiddleware])
    .validator(adminBookingsSearchSchema)
    .handler(async ({ data }) => {
        return getServerApiClient().get("admin/bookings", { searchParams: data }).json<AdminBookingsResponse>();
    });

export const getAdminBookingStatsFn = createServerFn({ method: "GET" })
    .middleware([adminUserMiddleware])
    .handler(async () => {
        return getServerApiClient().get("admin/bookings/stats").json<{
            popularRoom: string | null;
            todayCount: number;
            weekCount: number;
        }>();
    });

export const cancelAdminBookingFn = createServerFn({ method: "POST" })
    .middleware([adminUserMiddleware])
    .validator(cancelBookingSchema)
    .handler(async ({ data }) => {
        const { bookingId, ...input } = data;

        return getServerApiClient().post(`admin/bookings/${bookingId}/cancel`, { json: input }).json<{ id: string }>();
    });
