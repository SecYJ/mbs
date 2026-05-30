import { z } from "zod";

export const roomBookingSearchDefaults = {
    date: undefined as string | undefined,
    bookingId: undefined as string | undefined,
};

export const roomBookingSearchSchema = z.object({
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .catch(roomBookingSearchDefaults.date),
    bookingId: z.string().uuid().optional().catch(roomBookingSearchDefaults.bookingId),
});
