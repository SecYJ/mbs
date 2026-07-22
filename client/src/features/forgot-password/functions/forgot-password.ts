import { createServerFn } from "@tanstack/react-start";

import { forgotPasswordSchema } from "@/features/forgot-password/schema/forgot-password.schema";
import { getServerApiClient } from "@/lib/server-api-client";

export const requestPasswordResetFn = createServerFn({ method: "POST" })
    .validator(forgotPasswordSchema)
    .handler(async ({ data }) => {
        await getServerApiClient().post("auth/request-password-reset", {
            context: { forwardCookie: false },
            json: {
                email: data.email,
                redirectTo: new URL("/reset-password", process.env.SERVER_URL ?? "http://localhost:5173").toString(),
            },
        });

        return { dispatched: true };
    });
