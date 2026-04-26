import { z } from "zod";

const resetPasswordBaseSchema = z.object({
    newPassword: z.string().min(8, "Passphrase must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your passphrase"),
    token: z.string().min(1, "Reset token is missing"),
});

export const resetPasswordServerSchema = resetPasswordBaseSchema.omit({ confirmPassword: true });

export const resetPasswordSchema = resetPasswordBaseSchema.refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passphrases do not match",
});
