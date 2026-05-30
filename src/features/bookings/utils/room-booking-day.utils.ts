import type { BookingCalendarEvent } from "@/features/bookings/utils/booking-calendar.utils";

export type RoomDaySegment =
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
      };

const padDatePart = (value: number) => value.toString().padStart(2, "0");

export const formatDateKey = (date: Date) =>
    `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;

export const startOfDay = (date: Date) => {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
};

export const parseDateKey = (value: string | undefined) => {
    if (!value) return startOfDay(new Date());

    const parts = value.split("-").map(Number);
    const year = parts[0] ?? NaN;
    const month = parts[1] ?? NaN;
    const day = parts[2] ?? NaN;
    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) return startOfDay(new Date());
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return startOfDay(new Date());
    }

    return startOfDay(date);
};

export const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const addMinutes = (date: Date, minutes: number) => {
    const next = new Date(date);
    next.setMinutes(next.getMinutes() + minutes, 0, 0);
    return next;
};

const maxDate = (a: Date, b: Date) => (a.getTime() > b.getTime() ? a : b);

const minDate = (a: Date, b: Date) => (a.getTime() < b.getTime() ? a : b);

export const getDayBounds = (date: Date) => {
    const start = new Date(date);
    start.setHours(7, 0, 0, 0);
    const end = addDays(startOfDay(date), 1);
    return { start, end };
};

const roundUpToHalfHour = (date: Date) => {
    const next = new Date(date);
    next.setSeconds(0, 0);
    const minutes = next.getMinutes();
    const remainder = minutes % 30;

    if (remainder > 0) {
        next.setMinutes(minutes + (30 - remainder), 0, 0);
    }

    if (next.getTime() <= date.getTime()) {
        next.setMinutes(next.getMinutes() + 30, 0, 0);
    }

    return next;
};

export const formatLongDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

export const formatShortDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

export const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

export const formatMinuteDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes} min`;
    if (remainingMinutes === 0) return `${hours} hr${hours === 1 ? "" : "s"}`;
    return `${hours} hr ${remainingMinutes} min`;
};

export const formatDuration = (start: Date, end: Date) => {
    const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
    return formatMinuteDuration(minutes);
};

export const getRoomDayEvents = (events: BookingCalendarEvent[], roomId: string, dayStart: Date, dayEnd: Date) =>
    events
        .filter((event) => {
            if (event.roomId !== roomId) return false;
            const start = new Date(event.start);
            const end = new Date(event.end);
            return start < dayEnd && end > dayStart;
        })
        .toSorted((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

export const getDaySegments = (events: BookingCalendarEvent[], dayStart: Date, dayEnd: Date) => {
    const segments: RoomDaySegment[] = [];
    let cursor = dayStart;

    for (const event of events) {
        const bookingStart = maxDate(new Date(event.start), dayStart);
        const bookingEnd = minDate(new Date(event.end), dayEnd);

        if (bookingStart.getTime() > cursor.getTime()) {
            segments.push({ type: "free", start: cursor, end: bookingStart });
        }

        if (bookingEnd.getTime() > bookingStart.getTime()) {
            segments.push({ type: "booking", start: bookingStart, end: bookingEnd, event });
        }

        if (bookingEnd.getTime() > cursor.getTime()) {
            cursor = bookingEnd;
        }
    }

    if (cursor.getTime() < dayEnd.getTime()) {
        segments.push({ type: "free", start: cursor, end: dayEnd });
    }

    return segments;
};

export const getFirstBookableSlot = (segments: RoomDaySegment[], roomAvailable: boolean) => {
    if (!roomAvailable) return null;

    const nextStart = roundUpToHalfHour(new Date());

    for (const segment of segments) {
        if (segment.type !== "free") continue;

        const start = maxDate(segment.start, nextStart);
        const end = minDate(addMinutes(start, 60), segment.end);

        if (end.getTime() > start.getTime()) {
            return { start, end };
        }
    }

    return null;
};

export const getBookableSlotForSegment = (segment: Extract<RoomDaySegment, { type: "free" }>) => {
    const start = maxDate(segment.start, roundUpToHalfHour(new Date()));
    const end = minDate(addMinutes(start, 60), segment.end);
    return end.getTime() > start.getTime() ? { start, end } : null;
};

export const isPastEvent = (event: BookingCalendarEvent) => new Date(event.end).getTime() <= Date.now();
