import { z } from "zod";

const queryArraySchema = z.union([z.string().array(), z.string().transform((value) => [value])]).default([]);

export const bookingRoomFiltersSchema = z.object({
    capacity: z.coerce.number().int().min(0).default(0),
    equipment: queryArraySchema,
    location: queryArraySchema,
});

export const bookingEventsSchema = bookingRoomFiltersSchema.extend({
    rangeStart: z.iso.datetime(),
    rangeEnd: z.iso.datetime(),
    roomId: z.uuid().optional(),
});

export const bookingIdSchema = z.object({ bookingId: z.uuid() });
export const bookingRoomIdSchema = z.object({ roomId: z.uuid() });

const bookingFieldsSchema = z.object({
    title: z.string().trim().min(1, "Meeting title is required").max(160, "Meeting title is too long"),
    roomId: z.uuid("Select a valid room"),
    startTime: z.iso.datetime("Select a valid start time"),
    endTime: z.iso.datetime("Select a valid end time"),
    description: z.string().trim().max(1000, "Description is too long").optional(),
    attendeeIds: z.array(z.string()).default([]),
});

export const createBookingSchema = bookingFieldsSchema;
export const updateBookingSchema = bookingFieldsSchema.extend({ bookingId: z.uuid("Select a valid booking") });

export const cancelBookingSchema = z.object({
    bookingId: z.uuid("Select a valid booking"),
    cancelReason: z.string().trim().max(500, "Cancellation reason is too long").optional(),
});

export const bookingRsvpSchema = z.object({
    bookingId: z.uuid(),
    status: z.enum(["accepted", "declined"]),
});

export type BookingRoomFilters = z.infer<typeof bookingRoomFiltersSchema>;
export type BookingEventsInput = z.infer<typeof bookingEventsSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type BookingRsvpInput = z.infer<typeof bookingRsvpSchema>;
