import { z } from "zod";

export const createEquipmentSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    brand: z.string().trim().min(1, "Brand is required"),
    model: z.string().trim().min(1, "Model is required"),
    price: z.number({ message: "Price must be a number" }).nonnegative("Price cannot be negative"),
    quantity: z
        .number({ message: "Quantity must be a number" })
        .int("Quantity must be a whole number")
        .min(1, "Quantity must be at least 1"),
    purchaseDate: z.iso.date("Purchase date is required"),
    warrantyExpiry: z
        .union([z.iso.date("Invalid date"), z.literal(""), z.undefined()])
        .transform((v) => (v ? v : undefined)),
});
