import { createServerFn } from "@tanstack/react-start";

import { auth } from "@/lib/auth";
import { registerServerSchema } from "@/features/register/schema/register.schema";

export const registerUserFn = createServerFn({ method: "POST" })
    .validator(registerServerSchema)
    .handler(async ({ data }) => {
        const { user } = await auth.api.signUpEmail({ body: data });

        return { user };
    });
