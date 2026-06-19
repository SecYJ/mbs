import { queryOptions } from "@tanstack/react-query";

import { getAdminBookingStatsFn, getAdminBookingsFn } from "@/features/admin/services/bookings/fns";

export type AdminBookingStatus = "upcoming" | "in-progress" | "completed" | "cancelled";

export type AdminBookingFilters = {
    q: string;
    room: string;
    status: AdminBookingStatus | "all";
};

export type AdminBookingsQueryData = Awaited<ReturnType<typeof getAdminBookingsFn>>;

export const adminBookingQueries = {
    all: () => ["admin", "bookings"],
    lists: () => [...adminBookingQueries.all(), "list"],
    list: (filters: AdminBookingFilters) =>
        queryOptions({
            queryKey: [...adminBookingQueries.lists(), filters],
            queryFn: () => getAdminBookingsFn({ data: filters }),
        }),
    stats: () =>
        queryOptions({
            queryKey: [...adminBookingQueries.all(), "stats"],
            queryFn: getAdminBookingStatsFn,
        }),
};
