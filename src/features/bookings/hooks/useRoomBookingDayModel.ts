import type { BookingCalendarData } from "@/features/bookings/services/queries";
import {
    getDayBounds,
    getDaySegments,
    getFirstBookableSlot,
    getRoomDayEvents,
    parseDateKey,
} from "@/features/bookings/utils/room-booking-day.utils";

export const useRoomBookingDayModel = ({
    data,
    date,
    roomId,
}: {
    data: BookingCalendarData;
    date: string | undefined;
    roomId: string;
}) => {
    const selectedDate = parseDateKey(date);
    const room = data.rooms.find((item) => item.id === roomId);
    const { start: dayStart, end: dayEnd } = getDayBounds(selectedDate);
    const dayEvents = room ? getRoomDayEvents(data.events, room.id, dayStart, dayEnd) : [];
    const segments = getDaySegments(dayEvents, dayStart, dayEnd);
    const bookableSlot = getFirstBookableSlot(segments, room?.available ?? false);
    const freeMinutes = segments.reduce(
        (total, segment) =>
            segment.type === "free"
                ? total + Math.max(0, segment.end.getTime() - segment.start.getTime()) / 60_000
                : total,
        0,
    );
    const liveEvent = dayEvents.find((event) => {
        const start = new Date(event.start).getTime();
        const end = new Date(event.end).getTime();
        const now = Date.now();
        return start <= now && now < end;
    });

    return {
        bookableSlot,
        dayEnd,
        dayEvents,
        dayStart,
        freeMinutes,
        liveEvent,
        room,
        segments,
        selectedDate,
    };
};
