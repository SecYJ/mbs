import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import {
    addDays,
    addMinutes,
    compareAsc,
    format,
    isAfter,
    isBefore,
    max as maxDate,
    min as minDate,
    set,
    startOfDay,
} from "date-fns";

import { useBookingCalendarEventsContext } from "@/features/bookings/contexts/BookingCalendarEventsContext";
import { bookingCalendarQueries, type BookingCalendarEvent } from "@/features/bookings/services/queries";
import { parseRoomBookingDateKey } from "@/features/bookings/utils/date-formatter";

const Route = getRouteApi("/_bookings/rooms/$roomId");

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

const getRoomDayEvents = (events: BookingCalendarEvent[], dayStart: Date, dayEnd: Date) =>
    events
        .filter((event) => isBefore(new Date(event.start), dayEnd) && isAfter(new Date(event.end), dayStart))
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

const getFirstBookableSlot = (segments: RoomBookingDaySegment[]) => {
    for (const segment of segments) {
        if (segment.type === "free" && segment.bookableSlot) {
            return segment.bookableSlot;
        }
    }

    return null;
};

export const useRoomDayModel = () => {
    const { roomId } = Route.useParams();
    const { date } = Route.useSearch();
    const navigate = Route.useNavigate();
    const calendarEvents = useBookingCalendarEventsContext();
    const selectedDate = parseRoomBookingDateKey(date);
    const { start: dayStart, end: dayEnd } = getDayBounds(selectedDate);

    const { data: room } = useSuspenseQuery(bookingCalendarQueries.room(roomId));

    const dayEvents = room ? getRoomDayEvents(calendarEvents, dayStart, dayEnd) : [];
    const segments = getDaySegments(dayEvents, dayStart, dayEnd);
    const bookableSlot = room ? getFirstBookableSlot(segments) : null;

    const goToDate = (nextDate: Date) => {
        navigate({
            search: (prev) => ({ ...prev, date: format(nextDate, "yyyy-MM-dd") }),
            replace: true,
        });
    };

    return {
        bookableSlot,
        goToDate,
        room,
        segments,
        selectedDate,
    };
};
