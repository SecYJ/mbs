import { useSuspenseQuery } from "@tanstack/react-query";
import type { EventInput } from "@fullcalendar/core";
import { useSearch } from "@tanstack/react-router";

import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import {
    getBookingEventInput,
    getFilteredRooms,
    getRoomAccent,
    getRoomFilterState,
    getVisibleEvents,
    type RoomAccent,
} from "@/features/bookings/utils/booking-calendar.utils";

export const useBookingCalendarModel = () => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const { capacity, equipment, location, view } = useSearch({ from: "/_bookings/bookings" });
    const accentByRoomId: Record<string, RoomAccent> = {};
    data.rooms.forEach((room, index) => {
        accentByRoomId[room.id] = getRoomAccent(index);
    });

    const roomFilterState = getRoomFilterState({ capacity, equipment, location });
    const filteredRooms = getFilteredRooms(data.rooms, roomFilterState);

    const resources = filteredRooms.map((room) => ({
        id: room.id,
        title: room.title,
        extendedProps: {
            location: room.location,
            capacity: room.capacity,
            equipment: room.equipment,
            accent: accentByRoomId[room.id],
        },
    }));

    const events = data.events.map<EventInput>(getBookingEventInput);
    const visibleEvents = getVisibleEvents(events, filteredRooms, view);
    const hasRooms = data.rooms.length > 0;
    const hasFilteredRooms = filteredRooms.length > 0;

    return {
        accentByRoomId,
        data,
        filteredRooms,
        hasRooms,
        resources,
        showCalendar: hasRooms && hasFilteredRooms,
        showFilterZeroState: hasRooms && !hasFilteredRooms,
        view,
        visibleEvents,
    };
};
