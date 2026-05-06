import { queryOptions } from "@tanstack/react-query";

import { getBookingCalendarDataFn, getBookingDetailsFn } from "@/features/bookings/services/fns";

export type BookingCalendarData = Awaited<ReturnType<typeof getBookingCalendarDataFn>>;
export type BookingDetailsData = Awaited<ReturnType<typeof getBookingDetailsFn>>;

export const bookingCalendarQueryOptions = () =>
    queryOptions({
        queryKey: ["bookings", "calendar"],
        queryFn: getBookingCalendarDataFn,
    });

export const bookingDetailsQueryOptions = (bookingId: string) =>
    queryOptions({
        queryKey: ["bookings", "details", bookingId],
        queryFn: () => getBookingDetailsFn({ data: { bookingId } }),
    });
