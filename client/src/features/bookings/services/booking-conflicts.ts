import { format } from "date-fns";
import { z } from "zod";

type BookingConflictDetails = {
    title: string | null;
    roomName: string;
    startTime: Date | string;
    endTime: Date | string;
    canViewDetails?: boolean;
};

type BookingConflictEvent = {
    id: string;
    resourceId: string;
    title: string | null;
    start: Date | string;
    end: Date | string;
};

type GetOverlappingBookingConflictOptions = {
    endTime: Date | string;
    events: BookingConflictEvent[];
    excludedBookingId?: string;
    roomId: string;
    roomName: string;
    startTime: Date | string;
};

const toDate = (value: Date | string) => {
    const result = z.coerce.date().safeParse(value);

    return result.success ? result.data : null;
};

export const getOverlappingBookingConflict = ({
    endTime,
    events,
    excludedBookingId,
    roomId,
    roomName,
    startTime,
}: GetOverlappingBookingConflictOptions): BookingConflictDetails | null => {
    const start = toDate(startTime);
    const end = toDate(endTime);

    if (!start || !end || end.getTime() <= start.getTime()) {
        return null;
    }

    const conflict = events.find((event) => {
        const eventStart = toDate(event.start);
        const eventEnd = toDate(event.end);

        if (!eventStart || !eventEnd) return false;
        if (event.resourceId !== roomId) return false;
        if (excludedBookingId && event.id === excludedBookingId) return false;

        return eventStart.getTime() < end.getTime() && eventEnd.getTime() > start.getTime();
    });

    if (!conflict) return null;

    return {
        title: conflict.title,
        roomName,
        startTime: conflict.start,
        endTime: conflict.end,
    };
};

export const getBookingConflictMessage = ({
    title,
    roomName,
    startTime,
    endTime,
    canViewDetails = true,
}: BookingConflictDetails) => {
    const start = toDate(startTime);
    const end = toDate(endTime);
    const occupiedSlot =
        start && end
            ? ` on ${format(start, "MMM d, yyyy")} from ${format(start, "h:mm a")} to ${format(end, "h:mm a")}`
            : "";
    const visibleTitle = canViewDetails ? title?.trim() : "";
    const titleContext = visibleTitle ? ` for "${visibleTitle}"` : "";

    return `${roomName} is occupied${occupiedSlot}${titleContext}. Choose a different time or room.`;
};
