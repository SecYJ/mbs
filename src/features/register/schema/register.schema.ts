import { z } from "zod";

const registerBaseSchema = z.object({
    name: z.string().trim().min(1, "Full name is required"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Passphrase must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your passphrase"),
});

export const registerServerSchema = registerBaseSchema.omit({ confirmPassword: true });

export const registerSchema = registerBaseSchema.refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passphrases do not match",
});
