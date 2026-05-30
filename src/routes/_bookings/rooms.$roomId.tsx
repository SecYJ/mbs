import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { RoomBookingDayPage } from "@/features/bookings/pages/room-booking-day-page";
import {
    roomBookingSearchDefaults,
    roomBookingSearchSchema,
} from "@/features/bookings/schemas/room-booking-search.schema";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";

export const Route = createFileRoute("/_bookings/rooms/$roomId")({
    validateSearch: roomBookingSearchSchema,
    search: {
        middlewares: [stripSearchParams(roomBookingSearchDefaults)],
    },
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(bookingCalendarQueryOptions()),
    component: RoomBookingDayPage,
});
