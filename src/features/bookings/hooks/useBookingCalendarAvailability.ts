import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import { getFilteredRooms, getRoomFilterState } from "@/features/bookings/utils/booking-calendar.utils";

export const useBookingCalendarAvailability = () => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const { capacity, equipment, location } = useSearch({ from: "/_bookings/bookings" });

    const roomFilterState = getRoomFilterState({ capacity, equipment, location });
    const filteredRooms = getFilteredRooms(data.rooms, roomFilterState);
    const hasRooms = data.rooms.length > 0;
    const hasFilteredRooms = filteredRooms.length > 0;

    return {
        currentUserRole: data.currentUserRole,
        showCalendar: hasRooms && hasFilteredRooms,
        showFilterZeroState: hasRooms && !hasFilteredRooms,
        showNoRoomsState: !hasRooms,
    };
};
