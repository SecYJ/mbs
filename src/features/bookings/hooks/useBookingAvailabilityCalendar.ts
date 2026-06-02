import { useSuspenseQuery } from "@tanstack/react-query";
import type { EventInput } from "@fullcalendar/core";
import { useSearch } from "@tanstack/react-router";

import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import {
    getBookingEventInput,
    getFilteredRooms,
    getRoomFilterState,
    getVisibleEvents,
} from "@/features/bookings/utils/booking-calendar";

export const useBookingAvailabilityCalendar = () => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const { capacity, equipment, location, view } = useSearch({ from: "/_bookings/bookings" });

    const roomFilterState = getRoomFilterState({ capacity, equipment, location });
    const filteredRooms = getFilteredRooms(data.rooms, roomFilterState);

    const resources = filteredRooms.map((room) => ({
        id: room.id,
        title: room.title,
        extendedProps: {
            location: room.location,
            capacity: room.capacity,
            equipment: room.equipment,
        },
    }));

    const events = data.events.map<EventInput>(getBookingEventInput);

    return {
        events: getVisibleEvents(events, filteredRooms, view),
        resources,
        view,
    };
};
