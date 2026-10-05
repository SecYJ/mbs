import { z } from "zod";

export { cancelBookingSchema as cancelAdminBookingSchema } from "#app/modules/booking/booking.schema";

export const adminBookingsFilterSchema = z.object({
    q: z.string().trim().catch(""),
    room: z.string().catch("all"),
    status: z.enum(["all", "upcoming", "in-progress", "completed", "cancelled"]).catch("all"),
});

export type AdminBookingsFilter = z.infer<typeof adminBookingsFilterSchema>;
