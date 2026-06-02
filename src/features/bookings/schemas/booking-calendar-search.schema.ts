import { z } from "zod";

import { bookingCalendarViews } from "@/features/bookings/utils/booking-calendar";

export const bookingCalendarSearchDefaults = {
    view: "day",
    capacity: 0,
    equipment: [],
    location: [],
} as const;

export const bookingCalendarSearchSchema = z.object({
    bookingId: z.uuid().optional().catch(undefined),
    view: z
        .enum(bookingCalendarViews)
        .catch(bookingCalendarSearchDefaults.view)
        .prefault(bookingCalendarSearchDefaults.view),
    capacity: z.number().catch(bookingCalendarSearchDefaults.capacity).prefault(bookingCalendarSearchDefaults.capacity),
    equipment: z.string().array().catch([]).prefault([]),
    location: z.string().array().catch([]).prefault([]),
});
