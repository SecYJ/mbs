import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { BookingCalendarPage } from "@/features/bookings/pages/BookingCalendarPage";
import {
    bookingCalendarSearchDefaults,
    bookingCalendarSearchSchema,
    getBookingCalendarViewRange,
} from "@/features/bookings/schemas/booking-calendar-search.schema";
import {
    bookableRoomsQueryOptions,
    bookingCalendarEventsQueryOptions,
    bookingCalendarQueryOptions,
    bookingCalendarRoomsQueryOptions,
    bookingCalendarSummaryQueryOptions,
} from "@/features/bookings/services/queries";

export const Route = createFileRoute("/_bookings/bookings")({
    validateSearch: bookingCalendarSearchSchema,
    search: {
        middlewares: [
            stripSearchParams({
                view: bookingCalendarSearchDefaults.view,
                capacity: bookingCalendarSearchDefaults.capacity,
                equipment: [],
                location: [],
            }),
        ],
    },
    loaderDeps: (deps) => deps.search,
    loader: ({ context: { queryClient }, deps: { view, capacity, equipment, location } }) => {
        const filters = { capacity, equipment, location };

        queryClient.ensureQueryData(bookingCalendarQueryOptions());
        queryClient.ensureQueryData(bookableRoomsQueryOptions());
        queryClient.ensureQueryData(bookingCalendarRoomsQueryOptions(filters));
        queryClient.ensureQueryData(
            bookingCalendarEventsQueryOptions({ ...getBookingCalendarViewRange(view, new Date()), filters }),
        );
        queryClient.ensureQueryData(bookingCalendarSummaryQueryOptions());
    },
    component: BookingCalendarPage,
});
