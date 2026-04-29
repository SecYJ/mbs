import { queryOptions } from "@tanstack/react-query";

import { getBookingCalendarDataFn } from "@/features/bookings/services/fns";

export type BookingCalendarData = Awaited<ReturnType<typeof getBookingCalendarDataFn>>;

export const bookingCalendarQueryOptions = () =>
    queryOptions({
        queryKey: ["bookings", "calendar"],
        queryFn: getBookingCalendarDataFn,
    });
