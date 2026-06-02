import { z } from "zod";

export const ADMIN_BOOKING_SEARCH_DEFAULTS = {
    q: "",
    room: "all",
    status: "all",
} as const;

export const adminBookingsSearchSchema = z.object({
    q: z.string().catch(ADMIN_BOOKING_SEARCH_DEFAULTS.q),
    room: z.string().catch(ADMIN_BOOKING_SEARCH_DEFAULTS.room),
    status: z
        .enum(["all", "upcoming", "in-progress", "completed", "cancelled"])
        .catch(ADMIN_BOOKING_SEARCH_DEFAULTS.status),
});
