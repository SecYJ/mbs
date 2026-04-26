import { createServerFn } from "@tanstack/react-start";

import { auth } from "@/lib/auth";
import { resetPasswordServerSchema } from "@/features/reset-password/schema/reset-password.schema";

export const resetPasswordFn = createServerFn({ method: "POST" })
    .inputValidator(resetPasswordServerSchema)
    .handler(async ({ data }) => {
        await auth.api.resetPassword({
            body: {
                newPassword: data.newPassword,
                token: data.token,
            },
        });

        return { reissued: true };
    });
