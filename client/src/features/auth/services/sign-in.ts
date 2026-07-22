import { createServerFn } from "@tanstack/react-start";

import { loginSchema } from "@/features/login/schema/login.schema";
import { getServerApiClient } from "@/lib/server-api-client";

export const signInFn = createServerFn({ method: "POST" })
    .validator(loginSchema)
    .handler(async ({ data }) => {
        await getServerApiClient().post("auth/sign-in/email", {
            json: data,
        });

        return { success: true };
    });
