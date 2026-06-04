import { z } from "zod";

import { PAST_BOOKING_START_MESSAGE } from "@/features/bookings/booking.constants";

export const createBookingSchema = z
    .object({
        title: z.string().trim().min(1, "Meeting title is required").max(160, "Meeting title is too long"),
        roomId: z.string().uuid("Select a valid room"),
        startTime: z.string().datetime("Select a valid start time"),
        endTime: z.string().datetime("Select a valid end time"),
        description: z.string().trim().max(1000, "Description is too long").optional(),
        attendeeIds: z.array(z.string()).default([]),
    })
    .superRefine((data, ctx) => {
        const startTimeMs = new Date(data.startTime).getTime();
        const endTimeMs = new Date(data.endTime).getTime();

        if (startTimeMs <= Date.now()) {
            ctx.addIssue({
                code: "custom",
                path: ["startTime"],
                message: PAST_BOOKING_START_MESSAGE,
            });
        }

        if (endTimeMs <= startTimeMs) {
            ctx.addIssue({
                code: "custom",
                path: ["endTime"],
                message: "End time must be after start time",
            });
        }
    });

export const updateBookingSchema = createBookingSchema.extend({
    bookingId: z.string().uuid("Select a valid booking"),
});

export const cancelBookingSchema = z.object({
    bookingId: z.string().uuid("Select a valid booking"),
    cancelReason: z.string().trim().max(500, "Cancellation reason is too long").optional(),
});
