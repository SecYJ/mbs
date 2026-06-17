import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams, useSearch } from "@tanstack/react-router";
import {
    addDays,
    compareAsc,
    differenceInMinutes,
    isAfter,
    isBefore,
    max as maxDate,
    min as minDate,
    set,
    startOfDay,
} from "date-fns";

import { useBookingCalendarEvents } from "@/features/bookings/hooks/useBookingCalendarEvents";
import { parseRoomBookingDateKey } from "@/features/bookings/schemas/room-booking-search.schema";
import { bookingCalendarQueryOptions, type BookingCalendarEvent } from "@/features/bookings/services/queries";

type OccupiedWindow = {
    start: Date;
    end: Date;
};

const deriveDayBounds = (date: Date) => {
    const start = set(date, { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 });
    const end = addDays(startOfDay(date), 1);
    return { start, end };
};

const filterRoomDayEvents = (events: BookingCalendarEvent[], dayStart: Date, dayEnd: Date) =>
    events
        .filter((event) => isBefore(new Date(event.start), dayEnd) && isAfter(new Date(event.end), dayStart))
        .toSorted((a, b) => compareAsc(new Date(a.start), new Date(b.start)));

const collectOccupiedWindows = (events: BookingCalendarEvent[], dayStart: Date, dayEnd: Date) => {
    const windows: OccupiedWindow[] = [];

    for (const event of events) {
        const start = maxDate([new Date(event.start), dayStart]);
        const end = minDate([new Date(event.end), dayEnd]);

        if (!isAfter(end, start)) continue;

        const lastWindow = windows.at(-1);

        if (lastWindow && !isAfter(start, lastWindow.end)) {
            lastWindow.end = maxDate([lastWindow.end, end]);
            continue;
        }

        windows.push({ start, end });
    }

    return windows;
};

export const useRoomBookingSummaryModel = () => {
    const { roomId } = useParams({ from: "/_bookings/rooms/$roomId" });
    const { date } = useSearch({ from: "/_bookings/rooms/$roomId" });
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const calendarEvents = useBookingCalendarEvents();

    const selectedDate = parseRoomBookingDateKey(date);
    const room = data.rooms.find((item) => item.id === roomId);
    const { start: dayStart, end: dayEnd } = deriveDayBounds(selectedDate);
    const dayEvents = room ? filterRoomDayEvents(calendarEvents, dayStart, dayEnd) : [];
    const occupiedMinutes = collectOccupiedWindows(dayEvents, dayStart, dayEnd).reduce(
        (total, window) => total + differenceInMinutes(window.end, window.start),
        0,
    );
    const liveEvent = dayEvents.find((event) => {
        const start = new Date(event.start).getTime();
        const end = new Date(event.end).getTime();
        const now = Date.now();
        return start <= now && now < end;
    });

    return {
        bookingCount: dayEvents.length,
        freeMinutes: Math.max(0, differenceInMinutes(dayEnd, dayStart) - occupiedMinutes),
        liveEvent,
        room,
    };
};
