import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
        PORT: z.coerce.number().int().min(1).max(65535).default(3000),
        HOST: z.string().min(1).default("127.0.0.1"),
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

// Reset-password links are only emailed in production; without a key they would never reach users.
if (env.NODE_ENV === "production" && !env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required when NODE_ENV=production");
}
