import { createFileRoute } from "@tanstack/react-router";

import { BookingDetailsPage } from "@/features/bookings/pages/booking-details-page";
import { bookingDetailsQueryOptions } from "@/features/bookings/services/queries";

export const Route = createFileRoute("/_bookings/bookings_/$bookingId")({
    loader: ({ context: { queryClient }, params }) =>
        queryClient.ensureQueryData(bookingDetailsQueryOptions(params.bookingId)),
    component: BookingDetailsPage,
});
