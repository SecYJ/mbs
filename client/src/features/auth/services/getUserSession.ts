import { createServerFn } from "@tanstack/react-start";

import { authSessionSchema } from "@/features/auth/schemas/auth-session.schema";
import { getServerApiClient } from "@/lib/server-api-client";

export const getUserSession = createServerFn({ method: "GET" }).handler(async () => {
    try {
        const payload = await getServerApiClient().get("auth/get-session").json();

        return authSessionSchema.parse(payload);
    } catch (error) {
        console.log("error", error);
    }
});
