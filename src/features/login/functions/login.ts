import { createServerFn } from "@tanstack/react-start";

import { auth } from "@/lib/auth";
import { loginSchema } from "@/features/login/schema/login.schema";

export const loginUser = createServerFn({ method: "POST" })
    .inputValidator(loginSchema)
    .handler(async ({ data }) => {
        const { user } = await auth.api.signInEmail({ body: data });

        return { user };
    });
