import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import { useBookingCalendarEvents } from "@/features/bookings/hooks/useBookingCalendarEvents";
import { bookingCalendarRoomsQueryOptions } from "@/features/bookings/services/queries";

export const useBookingAvailabilityCalendar = () => {
    const { capacity, equipment, location, view } = useSearch({ from: "/_bookings/bookings" });
    const { data } = useSuspenseQuery(bookingCalendarRoomsQueryOptions({ capacity, equipment, location }));
    const events = useBookingCalendarEvents();

    const resources = data.rooms.map((room) => ({
        id: room.id,
        title: room.title,
        extendedProps: {
            location: room.location,
            capacity: room.capacity,
            equipment: room.equipment,
        },
    }));

    return {
        events,
        resources,
        view,
    };
};
