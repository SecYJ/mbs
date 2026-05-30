import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { format, isWithinInterval, subMilliseconds } from "date-fns";

import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import { useBookingCalendarStore } from "@/features/bookings/stores/booking-calendar-store";
import { sortStrings } from "@/features/bookings/utils/booking-calendar.utils";

export const useBookingCalendarControls = () => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const { view } = useSearch({ from: "/_bookings/bookings" });
    const visibleRange = useBookingCalendarStore((state) => state.visibleRange);
    const rooms = data.rooms;
    const allEquipment = sortStrings(Array.from(new Set(rooms.flatMap((room) => room.equipment))));
    const allLocations = sortStrings(Array.from(new Set(rooms.map((room) => room.location))));
    const now = new Date();
    const viewContainsToday = visibleRange
        ? isWithinInterval(now, {
              start: visibleRange.activeStart,
              end: subMilliseconds(visibleRange.activeEnd, 1),
          })
        : true;
    const todayButtonLabel = viewContainsToday
        ? `Today · ${format(now, "EEEE, MMMM d, yyyy")}`
        : (visibleRange?.title ?? format(now, "MMMM yyyy"));

    return {
        allEquipment,
        allLocations,
        rooms,
        todayButtonLabel,
        view,
        viewContainsToday,
    };
};
