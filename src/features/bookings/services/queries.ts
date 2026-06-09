import { queryOptions } from "@tanstack/react-query";
import { format } from "date-fns";

import type { MyBookingGroup } from "@/features/bookings/my-bookings.constants";
import {
    getBookingCalendarDataFn,
    getBookingDetailsFn,
    getMyBookingsDataFn,
    getMyBookingsStatsFn,
} from "@/features/bookings/services/fns";

export type BookingCalendarData = Awaited<ReturnType<typeof getBookingCalendarDataFn>>;

type MyBookingsFilters = {
    group: MyBookingGroup;
    q: string;
};

export const bookingCalendarQueryOptions = () =>
    queryOptions({
        queryKey: ["bookings", "calendar"],
        queryFn: getBookingCalendarDataFn,
    });

export const myBookingsQueryKey = ["bookings", "my-bookings"] as const;

export const myBookingsQueryOptions = (filters: MyBookingsFilters) =>
    queryOptions({
        queryKey: [...myBookingsQueryKey, filters],
        queryFn: () => getMyBookingsDataFn({ data: filters }),
        select: (data) => ({
            ...data,
            history: data.history.map((booking) => ({
                ...booking,
                displayDate: format(new Date(booking.start), "EEE, MMM d, yyyy"),
                displayTime: `${format(new Date(booking.start), "HH:mm")} - ${format(new Date(booking.end), "HH:mm")}`,
            })),
        }),
    });

export const myBookingsStatsQueryOptions = () =>
    queryOptions({
        queryKey: ["bookings", "my-bookings", "stats"],
        queryFn: () => getMyBookingsStatsFn(),
    });

export const bookingDetailsQueryOptions = (bookingId: string) =>
    queryOptions({
        queryKey: ["bookings", "details", bookingId],
        queryFn: () => getBookingDetailsFn({ data: { bookingId } }),
    });
