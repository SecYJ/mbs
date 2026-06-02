import { createMiddleware } from "@tanstack/react-start";

import { requireAuthenticatedUser } from "@/lib/session";

export const authenticatedUserMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
    const session = await requireAuthenticatedUser();

    return next({
        context: { session },
    });
});
