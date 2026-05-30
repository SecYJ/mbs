import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { BookingCalendarPage } from "@/features/bookings/pages/booking-calendar-page";
import {
    bookingCalendarSearchDefaults,
    bookingCalendarSearchSchema,
} from "@/features/bookings/schemas/booking-calendar-search.schema";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";

export const Route = createFileRoute("/_bookings/bookings")({
    validateSearch: bookingCalendarSearchSchema,
    search: {
        middlewares: [stripSearchParams(bookingCalendarSearchDefaults)],
    },
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(bookingCalendarQueryOptions()),
    component: BookingCalendarPage,
});
