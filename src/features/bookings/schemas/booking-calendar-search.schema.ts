import { z } from "zod";

import { bookingCalendarViews } from "@/features/bookings/utils/booking-calendar.utils";

const stringArraySearch = z
    .union([z.string().array(), z.string()])
    .optional()
    .transform((value) => {
        if (!value) return [];
        return Array.isArray(value) ? value : [value];
    })
    .catch([]);

export const bookingCalendarSearchDefaults = {
    view: "day",
    capacity: 0,
    equipment: [] as string[],
    location: [] as string[],
} as const;

export const bookingCalendarSearchSchema = z.object({
    bookingId: z.uuid().optional().catch(undefined),
    view: z
        .enum(bookingCalendarViews)
        .default(bookingCalendarSearchDefaults.view)
        .catch(bookingCalendarSearchDefaults.view),
    capacity: z.number().default(bookingCalendarSearchDefaults.capacity).catch(bookingCalendarSearchDefaults.capacity),
    equipment: stringArraySearch.default(bookingCalendarSearchDefaults.equipment),
    location: stringArraySearch.default(bookingCalendarSearchDefaults.location),
});
