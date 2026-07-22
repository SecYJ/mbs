import { z } from "zod";

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Enter your current passphrase"),
        newPassword: z.string().min(8, "Passphrase must be at least 8 characters"),
        confirmNewPassword: z.string().min(1, "Please confirm your new passphrase"),
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
        path: ["newPassword"],
        message: "Choose a passphrase that differs from the current one",
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        path: ["confirmNewPassword"],
        message: "Passphrases do not match",
    });
