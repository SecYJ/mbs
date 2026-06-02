import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import {
    getFilteredRoomCount,
    getLiveBookingCount,
    getRoomFilterState,
} from "@/features/bookings/utils/booking-calendar";

export const useBookingCalendarSummary = () => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const { capacity, equipment, location } = useSearch({ from: "/_bookings/bookings" });
    const roomFilterState = getRoomFilterState({ capacity, equipment, location });

    return {
        bookingCount: data.events.length,
        filteredRoomCount: getFilteredRoomCount(data.rooms, roomFilterState),
        liveBookingCount: getLiveBookingCount(data.events, new Date()),
        totalRoomCount: data.rooms.length,
    };
};
