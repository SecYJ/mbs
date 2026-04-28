import { z } from "zod";

export const createRoomSchema = z.object({
    name: z.string().trim().min(1, "Room name is required"),
    location: z.string().trim().min(1, "Location is required"),
    capacity: z
        .number({ message: "Capacity must be a number" })
        .int("Capacity must be a whole number")
        .min(1, "Capacity must be at least 1"),
    available: z.boolean(),
});
