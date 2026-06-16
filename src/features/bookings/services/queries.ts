import { queryOptions } from "@tanstack/react-query";
import { format } from "date-fns";

import type { MyBookingGroup } from "@/features/bookings/my-bookings.constants";
import {
    getBookingCalendarDataFn,
    getBookingCalendarEventsFn,
    getBookingCalendarRoomCatalogFn,
    getBookingCalendarRoomsFn,
    getBookingCalendarSummaryFn,
    getBookingDetailsFn,
    getMyBookingsDataFn,
    getMyBookingsStatsFn,
} from "@/features/bookings/services/fns";

export type BookingCalendarData = Awaited<ReturnType<typeof getBookingCalendarDataFn>>;
export type BookingCalendarEvents = Awaited<ReturnType<typeof getBookingCalendarEventsFn>>;
export type BookingCalendarEvent = BookingCalendarEvents[number];
export type BookingCalendarRooms = Awaited<ReturnType<typeof getBookingCalendarRoomsFn>>;
export type BookingCalendarRoomCatalog = Awaited<ReturnType<typeof getBookingCalendarRoomCatalogFn>>;
export type BookingCalendarSummary = Awaited<ReturnType<typeof getBookingCalendarSummaryFn>>;

export type BookingRoomFilters = {
    capacity: number;
    equipment: string[];
    location: string[];
};

export type BookingCalendarEventsScope = {
    start: Date;
    end: Date;
    roomId?: string;
    filters?: BookingRoomFilters;
};

// Sorted copies keep the query key stable regardless of the order the user
// toggled the filter options in.
const normalizeRoomFilters = ({ capacity, equipment, location }: BookingRoomFilters) => ({
    capacity,
    equipment: equipment.toSorted(),
    location: location.toSorted(),
});

type MyBookingsFilters = {
    group: MyBookingGroup;
    q: string;
};

export const bookingCalendarQueryOptions = () =>
    queryOptions({
        queryKey: ["bookings", "calendar"],
        queryFn: getBookingCalendarDataFn,
    });

export const bookingCalendarEventsQueryOptions = ({ start, end, roomId, filters }: BookingCalendarEventsScope) => {
    const data = {
        rangeStart: start.toISOString(),
        rangeEnd: end.toISOString(),
        ...(roomId ? { roomId } : filters ? normalizeRoomFilters(filters) : {}),
    };

    return queryOptions({
        queryKey: ["bookings", "calendar", "events", data],
        queryFn: () => getBookingCalendarEventsFn({ data }),
    });
};

export const bookingCalendarRoomsQueryOptions = (filters: BookingRoomFilters) => {
    const data = normalizeRoomFilters(filters);

    return queryOptions({
        queryKey: ["bookings", "calendar", "rooms", data],
        queryFn: () => getBookingCalendarRoomsFn({ data }),
    });
};

// Nested under ["bookings", "calendar"] so the post-mutation invalidations of
// that key refresh this catalog too.
export const bookingCalendarRoomCatalogQueryOptions = () =>
    queryOptions({
        queryKey: ["bookings", "calendar", "room-catalog"],
        queryFn: getBookingCalendarRoomCatalogFn,
    });

export const bookingCalendarSummaryQueryOptions = () =>
    queryOptions({
        queryKey: ["bookings", "calendar", "summary"],
        queryFn: getBookingCalendarSummaryFn,
        refetchInterval: 60_000,
    });

export const myBookingsQueryKey = ["bookings", "my-bookings"] as const;

export const myBookingsQueryOptions = (filters: MyBookingsFilters) =>
    queryOptions({
        queryKey: [...myBookingsQueryKey, filters],
        queryFn: () => getMyBookingsDataFn({ data: filters }),
        select: (data) => ({
            ...data,
            history: data.history.map((booking) => ({
                ...booking,
                displayDate: format(new Date(booking.start), "EEE, MMM d, yyyy"),
                displayTime: `${format(new Date(booking.start), "HH:mm")} - ${format(new Date(booking.end), "HH:mm")}`,
            })),
        }),
    });

export const myBookingsStatsQueryOptions = () =>
    queryOptions({
        queryKey: ["bookings", "my-bookings", "stats"],
        queryFn: getMyBookingsStatsFn,
    });

export const bookingDetailsQueryOptions = (bookingId: string) =>
    queryOptions({
        queryKey: ["bookings", "details", bookingId],
        queryFn: () => getBookingDetailsFn({ data: { bookingId } }),
    });
