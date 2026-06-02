import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams, useSearch } from "@tanstack/react-router";
import {
    addDays,
    compareAsc,
    differenceInMinutes,
    format,
    isAfter,
    isBefore,
    isValid,
    max as maxDate,
    min as minDate,
    parse,
    set,
    startOfDay,
} from "date-fns";

import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import type { BookingCalendarEvent } from "@/features/bookings/utils/booking-calendar";

type OccupiedWindow = {
    start: Date;
    end: Date;
};

const parseDateKey = (value: string | undefined) => {
    if (!value) return startOfDay(new Date());

    const parsedDate = parse(value, "yyyy-MM-dd", new Date());

    if (!isValid(parsedDate) || format(parsedDate, "yyyy-MM-dd") !== value) {
        return startOfDay(new Date());
    }

    return startOfDay(parsedDate);
};

const deriveDayBounds = (date: Date) => {
    const start = set(date, { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 });
    const end = addDays(startOfDay(date), 1);
    return { start, end };
};

const filterRoomDayEvents = (events: BookingCalendarEvent[], roomId: string, dayStart: Date, dayEnd: Date) =>
    events
        .filter((event) => {
            if (event.roomId !== roomId) return false;

            return isBefore(new Date(event.start), dayEnd) && isAfter(new Date(event.end), dayStart);
        })
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

    const selectedDate = parseDateKey(date);
    const room = data.rooms.find((item) => item.id === roomId);
    const { start: dayStart, end: dayEnd } = deriveDayBounds(selectedDate);
    const dayEvents = room ? filterRoomDayEvents(data.events, room.id, dayStart, dayEnd) : [];
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
