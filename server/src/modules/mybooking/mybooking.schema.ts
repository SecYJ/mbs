import { z } from "zod";

export const myBookingQuerySchema = z.object({
    group: z.enum(["upcoming", "in-progress", "past"]).optional(),
    q: z.string().optional(),
});
