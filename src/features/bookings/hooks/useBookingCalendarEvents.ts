import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMatch } from "@tanstack/react-router";

import { getBookingCalendarViewRange } from "@/features/bookings/schemas/booking-calendar-search.schema";
import {
    getRoomBookingDayRange,
    parseRoomBookingDateKey,
} from "@/features/bookings/schemas/room-booking-search.schema";
import {
    bookingCalendarEventsQueryOptions,
    type BookingCalendarEvents,
    type BookingCalendarEventsScope,
} from "@/features/bookings/services/queries";
import { useBookingCalendarStore } from "@/features/bookings/stores/booking-calendar-store";

const emptyEvents: BookingCalendarEvents = [];

// Resolves which events the current page needs: the room day page asks for
// its selected day scoped to that room, the calendar page asks for the
// mounted calendar's visible range (or the range implied by the view before
// FullCalendar reports one) scoped by the active room filters. The fallbacks
// must match what the route loaders prefetch so the first render is served
// from the cache.
const useBookingCalendarEventsScope = (): BookingCalendarEventsScope => {
    const calendarMatch = useMatch({ from: "/_bookings/bookings", shouldThrow: false });
    const roomDayMatch = useMatch({ from: "/_bookings/rooms/$roomId", shouldThrow: false });
    const visibleRange = useBookingCalendarStore((state) => state.visibleRange);

    if (roomDayMatch) {
        return {
            ...getRoomBookingDayRange(parseRoomBookingDateKey(roomDayMatch.search.date)),
            roomId: roomDayMatch.params.roomId,
        };
    }

    const search = calendarMatch?.search;
    const range = visibleRange
        ? { start: visibleRange.activeStart, end: visibleRange.activeEnd }
        : getBookingCalendarViewRange(search?.view ?? "day", new Date());

    return {
        ...range,
        filters: search
            ? { capacity: search.capacity, equipment: search.equipment, location: search.location }
            : undefined,
    };
};

export const useBookingCalendarEvents = () => {
    const scope = useBookingCalendarEventsScope();

    const { data } = useQuery({
        ...bookingCalendarEventsQueryOptions(scope),
        placeholderData: keepPreviousData,
    });

    return data ?? emptyEvents;
};
