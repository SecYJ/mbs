import { z } from "zod";

export const createEquipmentSchema = z
    .object({
        name: z.string().trim().min(1, "Name is required"),
        brand: z.string().trim().min(1, "Brand is required"),
        model: z.string().trim().min(1, "Model is required"),
        price: z.number({ error: () => "Price must be a number" }).nonnegative("Price cannot be negative"),
        quantity: z
            .number({ error: () => "Quantity must be a number" })
            .int("Quantity must be a whole number")
            .min(1, "Quantity must be at least 1"),
        purchaseDate: z.iso.date("Purchase date is required"),
        warrantyExpiry: z
            .union([z.iso.date("Invalid date"), z.literal(""), z.undefined()])
            .transform((v) => (v ? v : undefined)),
    })
    .superRefine((value, ctx) => {
        if (value.warrantyExpiry && value.warrantyExpiry < value.purchaseDate) {
            ctx.addIssue({
                code: "custom",
                path: ["warrantyExpiry"],
                message: "Warranty expiry must be on or after purchase date",
            });
        }
    });
