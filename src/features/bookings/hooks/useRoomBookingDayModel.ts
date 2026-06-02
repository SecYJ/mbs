import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import {
    addDays,
    addMinutes,
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

const roomBookingRoute = getRouteApi("/_bookings/rooms/$roomId");

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

const parseDateKey = (value: string | undefined) => {
    if (!value) return startOfDay(new Date());

    const parsedDate = parse(value, "yyyy-MM-dd", new Date());

    if (!isValid(parsedDate) || format(parsedDate, "yyyy-MM-dd") !== value) {
        return startOfDay(new Date());
    }

    return startOfDay(parsedDate);
};

const getDayBounds = (date: Date) => {
    const start = set(date, { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 });
    const end = addDays(startOfDay(date), 1);
    return { start, end };
};

const roundUpToHalfHour = (date: Date) => {
    const withoutSeconds = set(date, { seconds: 0, milliseconds: 0 });
    const remainder = withoutSeconds.getMinutes() % 30;
    const rounded = remainder > 0 ? addMinutes(withoutSeconds, 30 - remainder) : withoutSeconds;

    return rounded.getTime() <= date.getTime() ? addMinutes(rounded, 30) : rounded;
};

const getBookableSlot = (start: Date, end: Date) => {
    const slotStart = maxDate([start, roundUpToHalfHour(new Date())]);
    const slotEnd = minDate([addMinutes(slotStart, 60), end]);

    return isAfter(slotEnd, slotStart) ? { start: slotStart, end: slotEnd } : null;
};

const getRoomDayEvents = (events: BookingCalendarEvent[], roomId: string, dayStart: Date, dayEnd: Date) =>
    events
        .filter((event) => {
            if (event.roomId !== roomId) return false;

            return isBefore(new Date(event.start), dayEnd) && isAfter(new Date(event.end), dayStart);
        })
        .toSorted((a, b) => compareAsc(new Date(a.start), new Date(b.start)));

const getDaySegments = (events: BookingCalendarEvent[], dayStart: Date, dayEnd: Date) => {
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
                bookableSlot: getBookableSlot(cursor, bookingStart),
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
            bookableSlot: getBookableSlot(cursor, dayEnd),
        });
    }

    return segments;
};

const getFirstBookableSlot = (segments: RoomBookingDaySegment[], roomAvailable: boolean) => {
    if (!roomAvailable) return null;

    for (const segment of segments) {
        if (segment.type === "free" && segment.bookableSlot) {
            return segment.bookableSlot;
        }
    }

    return null;
};

export const useRoomBookingDayModel = () => {
    const { roomId } = roomBookingRoute.useParams();
    const { date } = roomBookingRoute.useSearch();
    const navigate = roomBookingRoute.useNavigate();
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());

    const selectedDate = parseDateKey(date);
    const room = data.rooms.find((item) => item.id === roomId);
    const { start: dayStart, end: dayEnd } = getDayBounds(selectedDate);
    const dayEvents = room ? getRoomDayEvents(data.events, room.id, dayStart, dayEnd) : [];
    const segments = getDaySegments(dayEvents, dayStart, dayEnd);
    const bookableSlot = getFirstBookableSlot(segments, room?.available ?? false);
    const freeMinutes = segments.reduce(
        (total, segment) => (segment.type === "free" ? total + differenceInMinutes(segment.end, segment.start) : total),
        0,
    );
    const liveEvent = dayEvents.find((event) => {
        const start = new Date(event.start).getTime();
        const end = new Date(event.end).getTime();
        const now = Date.now();
        return start <= now && now < end;
    });
    const goToDate = (nextDate: Date) => {
        navigate({
            search: (prev) => ({ ...prev, date: format(nextDate, "yyyy-MM-dd") }),
            replace: true,
        });
    };

    return {
        bookableSlot,
        dayEnd,
        dayEvents,
        dayStart,
        freeMinutes,
        goToDate,
        liveEvent,
        room,
        segments,
        selectedDate,
    };
};
