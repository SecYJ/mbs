import { queryOptions } from "@tanstack/react-query";

import {
    getBookingCalendarDataFn,
    getBookingCalendarEventsFn,
    getBookingCalendarRoomCatalogFn,
    getBookingCalendarRoomsFn,
    getBookingDetailsFn,
    getBookingRoomFn,
    getCalendarSummaryFn,
} from "@/features/bookings/services/fns";
import { getRoomBookingDayRange, parseRoomBookingDateKey } from "@/features/bookings/utils/date-formatter";

export type BookingCalendarData = Awaited<ReturnType<typeof getBookingCalendarDataFn>>;
export type BookingCalendarEvents = Awaited<ReturnType<typeof getBookingCalendarEventsFn>>;
export type BookingCalendarEvent = BookingCalendarEvents[number];
export type BookingCalendarRooms = Awaited<ReturnType<typeof getBookingCalendarRoomsFn>>;
export type BookingCalendarRoomCatalog = Awaited<ReturnType<typeof getBookingCalendarRoomCatalogFn>>;
export type CalendarSummary = Awaited<ReturnType<typeof getCalendarSummaryFn>>;

export type RoomFilters = {
    capacity: number;
    equipment: string[];
    location: string[];
};

export type BookingCalendarEventsScope = {
    rangeStart: string;
    rangeEnd: string;
    roomId?: string;
    filters?: RoomFilters;
};

// Sorted copies keep the query key stable regardless of the order the user
// toggled the filter options in.
const normalizeRoomFilters = ({ capacity, equipment, location }: RoomFilters) => ({
    capacity,
    equipment: equipment.toSorted(),
    location: location.toSorted(),
});

const normalizeBookingCalendarEventsScope = ({
    rangeStart,
    rangeEnd,
    roomId,
    filters,
}: BookingCalendarEventsScope) => ({
    rangeStart,
    rangeEnd,
    ...(roomId ? { roomId } : filters ? normalizeRoomFilters(filters) : {}),
});

export const bookingCalendarQueries = {
    all: () => ["bookings", "calendar"],
    data: () => {
        return queryOptions({
            queryKey: bookingCalendarQueries.all(),
            queryFn: getBookingCalendarDataFn,
        });
    },
    eventsKey: () => {
        return [...bookingCalendarQueries.all(), "events"];
    },
    events: (scope: BookingCalendarEventsScope) => {
        const data = normalizeBookingCalendarEventsScope(scope);

        return queryOptions({
            queryKey: [...bookingCalendarQueries.eventsKey(), data],
            queryFn: () => getBookingCalendarEventsFn({ data }),
        });
    },
    rooms: (filters: RoomFilters) => {
        const data = normalizeRoomFilters(filters);

        return queryOptions({
            queryKey: [...bookingCalendarQueries.all(), "rooms", data],
            queryFn: () => getBookingCalendarRoomsFn({ data }),
        });
    },
    room: (roomId: string) => {
        return queryOptions({
            queryKey: [...bookingCalendarQueries.all(), "room", roomId],
            queryFn: () => getBookingRoomFn({ data: { roomId } }),
        });
    },
    // Single entry point for the room day page: callers pass the raw `date`
    // search param and never touch the parse/range helpers themselves.
    roomDayEvents: ({ roomId, date }: { roomId: string; date: string | undefined }) =>
        bookingCalendarQueries.events({
            ...getRoomBookingDayRange(parseRoomBookingDateKey(date)),
            roomId,
        }),
    roomCatalog: () => {
        return queryOptions({
            queryKey: [...bookingCalendarQueries.all(), "room-catalog"],
            queryFn: getBookingCalendarRoomCatalogFn,
        });
    },
    summary: () => {
        return queryOptions({
            queryKey: [...bookingCalendarQueries.all(), "summary"],
            queryFn: getCalendarSummaryFn,
            refetchInterval: 60_000,
        });
    },
    detail: (bookingId: string) => {
        return queryOptions({
            queryKey: ["bookings", "details", bookingId],
            queryFn: () => getBookingDetailsFn({ data: { bookingId } }),
        });
    },
};
