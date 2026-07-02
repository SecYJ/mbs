import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { BookingCalendarPage } from "@/features/bookings/pages/BookingCalendarPage";
import {
    bookingCalendarSearchDefaults,
    bookingCalendarSearchSchema,
} from "@/features/bookings/schemas/booking-calendar-search.schema";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";
import { getBookingCalendarSearchRange } from "@/features/bookings/utils/date-formatter";

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

        queryClient.ensureQueryData(bookingCalendarQueries.data());
        queryClient.ensureQueryData(bookingCalendarQueries.roomCatalog());
        queryClient.ensureQueryData(bookingCalendarQueries.rooms(filters));
        queryClient.ensureQueryData(
            bookingCalendarQueries.events({ ...getBookingCalendarSearchRange({ view }), filters }),
        );
        queryClient.ensureQueryData(bookingCalendarQueries.summary());
    },
    component: BookingCalendarPage,
});
