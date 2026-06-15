import { addDays, addYears, startOfDay, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import { z } from "zod";

export const bookingCalendarViews = ["day", "week", "month", "year"] as const;
export type BookingCalendarView = (typeof bookingCalendarViews)[number];

export const bookingCalendarViewMap: Record<BookingCalendarView, string> = {
    day: "resourceTimeGridDay",
    week: "timeGridWeek",
    month: "dayGridMonth",
    year: "multiMonthYear",
};

export const bookingCalendarSearchDefaults = {
    view: "day",
    capacity: 0,
    equipment: [],
    location: [],
} as const;

export const bookingCalendarSearchSchema = z.object({
    bookingId: z.uuid().optional().catch(undefined),
    view: z
        .enum(bookingCalendarViews)
        .catch(bookingCalendarSearchDefaults.view)
        .prefault(bookingCalendarSearchDefaults.view),
    capacity: z.number().catch(bookingCalendarSearchDefaults.capacity).prefault(bookingCalendarSearchDefaults.capacity),
    equipment: z.string().array().catch([]).prefault([]),
    location: z.string().array().catch([]).prefault([]),
});

// Mirrors the active range FullCalendar computes for each view (firstDay=1,
// month grids keep the default fixed six weeks) so the loader-prefetched
// events land on the same query key the mounted calendar asks for.
export const getBookingCalendarViewRange = (view: BookingCalendarView, reference: Date) => {
    if (view === "day") {
        const start = startOfDay(reference);
        return { start, end: addDays(start, 1) };
    }
    if (view === "week") {
        const start = startOfWeek(reference, { weekStartsOn: 1 });
        return { start, end: addDays(start, 7) };
    }
    if (view === "month") {
        const start = startOfWeek(startOfMonth(reference), { weekStartsOn: 1 });
        return { start, end: addDays(start, 42) };
    }
    const start = startOfYear(reference);
    return { start, end: addYears(start, 1) };
};
