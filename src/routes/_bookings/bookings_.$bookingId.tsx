import { createFileRoute } from "@tanstack/react-router";

import { BookingDetailsPage } from "@/features/bookings/pages/BookingDetailsPage";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";

export const Route = createFileRoute("/_bookings/bookings_/$bookingId")({
    loader: ({ context: { queryClient }, params }) =>
        queryClient.ensureQueryData(bookingCalendarQueries.detail(params.bookingId)),
    component: BookingDetailsPage,
});
