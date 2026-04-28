import { z } from "zod";

const userBaseSchema = z.object({
    name: z.string().trim().min(1, "Full name is required"),
    email: z.email("Enter a valid email address").transform((email) => email.toLowerCase()),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm the password"),
});

export const createUserServerSchema = userBaseSchema.omit({ confirmPassword: true });

export const createUserSchema = userBaseSchema.refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});
