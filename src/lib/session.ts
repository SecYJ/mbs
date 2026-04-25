import { isRedirect, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";

export const getCurrentSession = createServerFn({ method: "GET" }).handler(async () => {
    const request = getRequest();
    return auth.api.getSession({ headers: request.headers });
});

export const redirectAuthenticatedUser = async () => {
    try {
        const session = await getCurrentSession();

        if (session) {
            throw redirect({ to: "/bookings" });
        }
    } catch (error) {
        if (isRedirect(error)) {
            throw error;
        }
    }
};
