import { createServerFn } from "@tanstack/react-start";

import { changePasswordSchema } from "@/features/settings/schema/change-password.schema";
import { getServerApiClient } from "@/lib/server-api-client";

export const changePasswordFn = createServerFn({ method: "POST" })
    .validator(changePasswordSchema)
    .handler(async ({ data }) => {
        await getServerApiClient().post("auth/change-password", {
            json: {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                revokeOtherSessions: true,
            },
        });
    });
