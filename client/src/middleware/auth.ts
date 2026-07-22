import { createMiddleware } from "@tanstack/react-start";

import { requireAdminUser, requireAuthenticatedUser } from "@/lib/session";

export const authenticatedUserMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
    const session = await requireAuthenticatedUser();

    return next({
        context: { session },
    });
});

export const adminUserMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
    const session = await requireAdminUser();

    return next({
        context: { session },
    });
});
