import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import { bookingCalendarQueryOptions, bookingCalendarRoomsQueryOptions } from "@/features/bookings/services/queries";

export const useBookingCalendarAvailability = () => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const { capacity, equipment, location } = useSearch({ from: "/_bookings/bookings" });
    const { data: roomsData } = useSuspenseQuery(bookingCalendarRoomsQueryOptions({ capacity, equipment, location }));

    const hasRooms = roomsData.totalRoomCount > 0;
    const hasFilteredRooms = roomsData.rooms.length > 0;

    return {
        currentUserRole: data.currentUserRole,
        showCalendar: hasRooms && hasFilteredRooms,
        showFilterZeroState: hasRooms && !hasFilteredRooms,
        showNoRoomsState: !hasRooms,
    };
};
