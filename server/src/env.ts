import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        SERVER_ORIGIN: z.url(),
        CLIENT_ORIGIN: z.url(),
        DATABASE_URL: z.url(),
        BETTER_AUTH_SECRET: z.string().min(32),
        RESEND_API_KEY: z.string().min(1).optional(),
        RESEND_FROM_EMAIL: z.string().min(1).optional(),
        API_VERSION: z.string().min(1),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
