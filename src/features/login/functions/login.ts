import { createServerFn } from "@tanstack/react-start";

import { getAuth } from "@/lib/auth-server";
import { loginSchema } from "@/features/login/schema/login.schema";

export const loginUserFn = createServerFn({ method: "POST" })
    .validator(loginSchema)
    .handler(async ({ data }) => {
        const auth = await getAuth();
        const { user } = await auth.api.signInEmail({ body: data });

        return { user };
    });
