import { USER_ROLES } from "@mbs/shared/roles";
import { z } from "zod";

const sessionSchema = z.object({
    id: z.string(),
    expiresAt: z.coerce.date(),
});

const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    emailVerified: z.boolean(),
    image: z.string().nullable(),
    role: z.enum(USER_ROLES),
});

export const authSessionSchema = z
    .object({
        session: sessionSchema,
        user: userSchema,
    })
    .nullable();
