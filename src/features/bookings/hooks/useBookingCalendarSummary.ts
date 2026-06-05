import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import {
    getBookableRooms,
    getFilteredRoomCount,
    getLiveBookingCount,
    getRoomFilterState,
} from "@/features/bookings/utils/booking-calendar";

export const useBookingCalendarSummary = () => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const { capacity, equipment, location } = useSearch({ from: "/_bookings/bookings" });
    const roomFilterState = getRoomFilterState({ capacity, equipment, location });
    const bookableRooms = getBookableRooms(data.rooms);
    const bookableRoomIds = new Set(bookableRooms.map((room) => room.id));
    const bookableEvents = data.events.filter((event) => bookableRoomIds.has(event.roomId));

    return {
        bookingCount: bookableEvents.length,
        filteredRoomCount: getFilteredRoomCount(bookableRooms, roomFilterState),
        liveBookingCount: getLiveBookingCount(bookableEvents, new Date()),
        totalRoomCount: bookableRooms.length,
    };
};
