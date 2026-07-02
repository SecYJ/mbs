import { createServerFn } from "@tanstack/react-start";

import { getAuth } from "@/lib/auth-server";
import { registerServerSchema } from "@/features/register/schema/register.schema";

export const registerUserFn = createServerFn({ method: "POST" })
    .validator(registerServerSchema)
    .handler(async ({ data }) => {
        const auth = await getAuth();
        const { user } = await auth.api.signUpEmail({ body: data });

        return { user };
    });
