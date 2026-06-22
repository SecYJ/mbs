import { createServerFn } from "@tanstack/react-start";

import { getAuth } from "@/lib/auth-server";
import { resetPasswordServerSchema } from "@/features/reset-password/schema/reset-password.schema";

export const resetPasswordFn = createServerFn({ method: "POST" })
    .validator(resetPasswordServerSchema)
    .handler(async ({ data }) => {
        const auth = await getAuth();

        await auth.api.resetPassword({
            body: {
                newPassword: data.newPassword,
                token: data.token,
            },
        });

        return { reissued: true };
    });
