import { z } from "zod";

export const roomBookingSearchDefaults = {
    date: undefined as string | undefined,
    bookingId: undefined as string | undefined,
};

export const roomBookingSearchSchema = z.object({
    date: z.iso.date().optional().catch(roomBookingSearchDefaults.date),
    bookingId: z.uuid().optional().catch(roomBookingSearchDefaults.bookingId),
});
