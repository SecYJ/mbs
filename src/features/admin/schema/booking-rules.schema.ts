import { z } from "zod";

export const updateBookingRulesSchema = z.object({
    maxBookingDurationHours: z
        .number({ error: () => "Must be a number" })
        .int("Must be a whole number")
        .min(1, "Minimum is 1 hour")
        .max(24, "Maximum is 24 hours"),
});

export type UpdateBookingRulesInput = z.infer<typeof updateBookingRulesSchema>;
