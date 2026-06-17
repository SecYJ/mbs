import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import {
    bookingCalendarQueryOptions,
    bookingCalendarRoomCatalogQueryOptions,
    bookingCalendarRoomsQueryOptions,
    type BookingCalendarData,
    type BookingCalendarRoomCatalog,
    type BookingCalendarRooms,
} from "@/features/bookings/services/queries";

const selectCurrentUserRole = (data: BookingCalendarData) => data.currentUserRole;
const selectHasRooms = (data: BookingCalendarRoomCatalog) => data.totalRoomCount > 0;
const selectHasFilteredRooms = (data: BookingCalendarRooms) => data.rooms.length > 0;

export const useBookingCalendarAvailability = () => {
    const { data: currentUserRole } = useSuspenseQuery({
        ...bookingCalendarQueryOptions(),
        select: selectCurrentUserRole,
    });
    const { capacity, equipment, location } = useSearch({ from: "/_bookings/bookings" });
    const { data: hasFilteredRooms } = useSuspenseQuery({
        ...bookingCalendarRoomsQueryOptions({ capacity, equipment, location }),
        select: selectHasFilteredRooms,
    });
    const { data: hasRooms } = useSuspenseQuery({
        ...bookingCalendarRoomCatalogQueryOptions(),
        select: selectHasRooms,
    });

    return {
        currentUserRole,
        showCalendar: hasRooms && hasFilteredRooms,
        showFilterZeroState: hasRooms && !hasFilteredRooms,
        showNoRoomsState: !hasRooms,
    };
};
