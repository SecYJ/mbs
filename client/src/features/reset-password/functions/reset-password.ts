import { createServerFn } from "@tanstack/react-start";

import { resetPasswordServerSchema } from "@/features/reset-password/schema/reset-password.schema";
import { getServerApiClient } from "@/lib/server-api-client";

export const resetPasswordFn = createServerFn({ method: "POST" })
    .validator(resetPasswordServerSchema)
    .handler(async ({ data }) => {
        await getServerApiClient().post("auth/reset-password", {
            json: {
                newPassword: data.newPassword,
                token: data.token,
            },
        });

        return { reissued: true };
    });
