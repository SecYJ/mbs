import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { RoomBookingDayPage } from "@/features/bookings/pages/RoomBookingDayPage";
import {
    getRoomBookingDayRange,
    parseRoomBookingDateKey,
    roomBookingSearchDefaults,
    roomBookingSearchSchema,
} from "@/features/bookings/schemas/room-booking-search.schema";
import {
    bookableRoomsQueryOptions,
    bookingCalendarEventsQueryOptions,
    bookingCalendarQueryOptions,
} from "@/features/bookings/services/queries";

export const Route = createFileRoute("/_bookings/rooms/$roomId")({
    validateSearch: roomBookingSearchSchema,
    search: {
        middlewares: [stripSearchParams(roomBookingSearchDefaults)],
    },
    loaderDeps: (deps) => deps.search,
    loader: ({ context: { queryClient }, params: { roomId }, deps: { date } }) => {
        queryClient.ensureQueryData(bookingCalendarQueryOptions());
        queryClient.ensureQueryData(bookableRoomsQueryOptions());
        queryClient.ensureQueryData(
            bookingCalendarEventsQueryOptions({
                ...getRoomBookingDayRange(parseRoomBookingDateKey(date)),
                roomId,
            }),
        );
    },
    component: RoomBookingDayPage,
});
