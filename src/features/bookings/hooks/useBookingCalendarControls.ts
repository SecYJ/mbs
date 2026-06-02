import { useSearch } from "@tanstack/react-router";
import { format, isWithinInterval, subMilliseconds } from "date-fns";

import { useBookingCalendarStore } from "@/features/bookings/stores/booking-calendar-store";

export const useBookingCalendarControls = () => {
    const { view } = useSearch({ from: "/_bookings/bookings" });
    const visibleRange = useBookingCalendarStore((state) => state.visibleRange);
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
        todayButtonLabel,
        view,
        viewContainsToday,
    };
};
