import { addDays, format, isValid, parse, startOfDay } from "date-fns";
import { z } from "zod";

export const roomBookingSearchDefaults = {
    date: undefined as string | undefined,
    bookingId: undefined as string | undefined,
};

export const roomBookingSearchSchema = z.object({
    date: z.iso.date().optional().catch(roomBookingSearchDefaults.date),
    bookingId: z.uuid().optional().catch(roomBookingSearchDefaults.bookingId),
});

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
    return { start, end: addDays(start, 1) };
};
