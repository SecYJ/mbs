import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useShallow } from "zustand/shallow";

import { bookingCalendarQueries } from "@/features/bookings/services/queries";
import { useBookingCalendarStore } from "@/features/bookings/stores/BookingCalendarStore";
import { getBookingCalendarSearchRange } from "@/features/bookings/utils/date-formatter";

const Route = getRouteApi("/_bookings/bookings");

export const useBookingCalendarEvents = () => {
    const search = Route.useSearch();
    const visibleRangeScope = useBookingCalendarStore(
        useShallow(({ visibleRange }) => {
            return visibleRange
                ? {
                      rangeStart: visibleRange.activeStart.toISOString(),
                      rangeEnd: visibleRange.activeEnd.toISOString(),
                  }
                : null;
        }),
    );
    const filters = { capacity: search.capacity, equipment: search.equipment, location: search.location };
    const range = visibleRangeScope ?? getBookingCalendarSearchRange({ view: search.view });

    const { data } = useQuery({
        ...bookingCalendarQueries.events({
            ...range,
            filters,
        }),
        placeholderData: keepPreviousData,
    });

    return {
        events: data ?? [],
    };
};
