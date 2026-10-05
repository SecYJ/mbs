import {
    addDays,
    addMinutes,
    compareAsc,
    differenceInMinutes,
    isAfter,
    isBefore,
    max as maxDate,
    min as minDate,
    set,
    startOfDay,
} from "date-fns";

import type { BookingCalendarEvent } from "@/features/bookings/services/queries";
import { parseRoomBookingDateKey } from "@/features/bookings/utils/date-formatter";

type RoomBookingSlot = {
    start: Date;
    end: Date;
};

export type RoomBookingDaySegment =
    | {
          type: "booking";
          start: Date;
          end: Date;
          event: BookingCalendarEvent;
      }
    | {
          type: "free";
          start: Date;
          end: Date;
          bookableSlot: RoomBookingSlot | null;
      };

function getDayBounds(date: Date) {
    const start = set(date, { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 });
    const end = addDays(startOfDay(date), 1);
    return { start, end };
}

function roundUpToHalfHour(date: Date) {
    const withoutSeconds = set(date, { seconds: 0, milliseconds: 0 });
    const remainder = withoutSeconds.getMinutes() % 30;
    const rounded = remainder > 0 ? addMinutes(withoutSeconds, 30 - remainder) : withoutSeconds;

    return rounded.getTime() <= date.getTime() ? addMinutes(rounded, 30) : rounded;
}

function getBookableSlot(start: Date, end: Date, now: Date) {
    const slotStart = maxDate([start, roundUpToHalfHour(now)]);
    const slotEnd = minDate([addMinutes(slotStart, 60), end]);

    return isAfter(slotEnd, slotStart) ? { start: slotStart, end: slotEnd } : null;
}

function getRoomDayEvents(events: BookingCalendarEvent[], dayStart: Date, dayEnd: Date) {
    return events
        .filter((event) => isBefore(new Date(event.start), dayEnd) && isAfter(new Date(event.end), dayStart))
        .toSorted((a, b) => compareAsc(new Date(a.start), new Date(b.start)));
}

function getDaySegments(events: BookingCalendarEvent[], dayStart: Date, dayEnd: Date, now: Date) {
    const segments: RoomBookingDaySegment[] = [];
    let cursor = dayStart;

    for (const event of events) {
        const bookingStart = maxDate([new Date(event.start), dayStart]);
        const bookingEnd = minDate([new Date(event.end), dayEnd]);

        if (isAfter(bookingStart, cursor)) {
            segments.push({
                type: "free",
                start: cursor,
                end: bookingStart,
                bookableSlot: getBookableSlot(cursor, bookingStart, now),
            });
        }

        if (isAfter(bookingEnd, bookingStart)) {
            segments.push({ type: "booking", start: bookingStart, end: bookingEnd, event });
        }

        if (isAfter(bookingEnd, cursor)) {
            cursor = bookingEnd;
        }
    }

    if (isBefore(cursor, dayEnd)) {
        segments.push({
            type: "free",
            start: cursor,
            end: dayEnd,
            bookableSlot: getBookableSlot(cursor, dayEnd, now),
        });
    }

    return segments;
}

function getFirstBookableSlot(segments: RoomBookingDaySegment[]) {
    for (const segment of segments) {
        if (segment.type === "free" && segment.bookableSlot) {
            return segment.bookableSlot;
        }
    }

    return null;
}

function collectOccupiedWindows(events: BookingCalendarEvent[], dayStart: Date, dayEnd: Date) {
    const windows: RoomBookingSlot[] = [];

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
}

export function getRoomDayModel(events: BookingCalendarEvent[], date: string | undefined, now = new Date()) {
    const selectedDate = parseRoomBookingDateKey(date);
    const { start: dayStart, end: dayEnd } = getDayBounds(selectedDate);
    const dayEvents = getRoomDayEvents(events, dayStart, dayEnd);
    const segments = getDaySegments(dayEvents, dayStart, dayEnd, now);
    const occupiedMinutes = collectOccupiedWindows(dayEvents, dayStart, dayEnd).reduce(
        (total, window) => total + differenceInMinutes(window.end, window.start),
        0,
    );

    return {
        bookableSlot: getFirstBookableSlot(segments),
        selectedDate,
        segments,
        summary: {
            bookingCount: dayEvents.length,
            freeMinutes: Math.max(0, differenceInMinutes(dayEnd, dayStart) - occupiedMinutes),
            hasLiveBooking: dayEvents.some((event) => new Date(event.start) <= now && now < new Date(event.end)),
        },
    };
}
