import {
    addDays,
    addYears,
    format,
    isValid,
    parse,
    parseISO,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
} from "date-fns";

import type { BookingCalendarView } from "@/features/bookings/schemas/booking-calendar-search.schema";

type BookingCalendarRangeInput = {
    date?: string;
    view: BookingCalendarView;
};

export const parseRoomBookingDateKey = (value: string | undefined) => {
    if (!value) return startOfDay(new Date());

    const parsedDate = parse(value, "yyyy-MM-dd", new Date());

    if (!isValid(parsedDate) || format(parsedDate, "yyyy-MM-dd") !== value) {
        return startOfDay(new Date());
    }

    return startOfDay(parsedDate);
};

export const getRoomBookingDayRange = (date: Date) => {
    const start = startOfDay(date);
    return { rangeStart: start.toISOString(), rangeEnd: addDays(start, 1).toISOString() };
};

const getBookingCalendarSearchDate = (date: string | undefined) => {
    if (!date) return new Date();

    const parsedDate = parseISO(date);

    return isValid(parsedDate) ? parsedDate : new Date();
};

// Mirrors the active range FullCalendar computes for each view (firstDay=1,
// month grids keep the default fixed six weeks) so the loader-prefetched
// events land on the same query key the mounted calendar asks for.
export const getBookingCalendarSearchRange = ({ date, view }: BookingCalendarRangeInput) => {
    const reference = getBookingCalendarSearchDate(date);

    if (view === "day") {
        const start = startOfDay(reference);
        return { rangeStart: start.toISOString(), rangeEnd: addDays(start, 1).toISOString() };
    }
    if (view === "week") {
        const start = startOfWeek(reference, { weekStartsOn: 1 });
        return { rangeStart: start.toISOString(), rangeEnd: addDays(start, 7).toISOString() };
    }
    if (view === "month") {
        const start = startOfWeek(startOfMonth(reference), { weekStartsOn: 1 });
        return { rangeStart: start.toISOString(), rangeEnd: addDays(start, 42).toISOString() };
    }
    const start = startOfYear(reference);

    return { rangeStart: start.toISOString(), rangeEnd: addYears(start, 1).toISOString() };
};
