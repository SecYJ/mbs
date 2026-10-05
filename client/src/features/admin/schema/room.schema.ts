import { z } from "zod";

export const createRoomSchema = z.object({
    name: z.string().trim().min(1, "Room name is required").max(100, "Room name is too long"),
    location: z.string().trim().min(1, "Location is required").max(160, "Location is too long"),
    capacity: z
        .number({ message: "Capacity must be a number" })
        .int("Capacity must be a whole number")
        .min(1, "Capacity must be at least 1"),
    maxBookingDurationHours: z
        .number({ message: "Max duration must be a number" })
        .int("Max duration must be a whole number")
        .min(1, "Max duration must be at least 1 hour")
        .max(24, "Max duration cannot exceed 24 hours"),
    available: z.boolean(),
});

export const updateRoomSchema = createRoomSchema.extend({
    roomId: z.uuid("Select a valid room"),
});

export const deleteRoomSchema = z.object({
    roomId: z.uuid("Select a valid room"),
});
