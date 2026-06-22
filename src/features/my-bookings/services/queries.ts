import { queryOptions } from "@tanstack/react-query";

import { getMyBookingsDataFn, getMyBookingsStatsFn } from "@/features/my-bookings/services/fns";
import type { MyBookingGroupType } from "@/features/my-bookings/my-bookings.constants";

type MyBookingsFilters = {
    group?: MyBookingGroupType;
    q?: string;
};

export type MyBookingsQueryData = Awaited<ReturnType<typeof getMyBookingsDataFn>>;
export type MyBookingsStatsQueryData = Awaited<ReturnType<typeof getMyBookingsStatsFn>>;

export const myBookingsQueries = {
    all: () => ["bookings", "my-bookings"],
    lists: () => [...myBookingsQueries.all(), "list"],
    list: (filters: MyBookingsFilters = {}) => {
        return queryOptions({
            queryKey: [...myBookingsQueries.lists(), filters],
            queryFn: () => getMyBookingsDataFn({ data: filters }),
        });
    },
    stats: () => {
        return queryOptions({
            queryKey: [...myBookingsQueries.all(), "stats"],
            queryFn: getMyBookingsStatsFn,
        });
    },
};
