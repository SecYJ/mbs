import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { status } from "http-status";

import { authSessionSchema } from "@/features/auth/schemas/auth-session.schema";
import { getServerApiClient } from "@/lib/server-api-client";
import { ServerApiError } from "@/lib/server-api-error";

type UserSession = ReturnType<typeof authSessionSchema.parse>;

// One page render runs several route guards and middlewares; share one lookup per request.
const sessionLookups = new WeakMap<Request, Promise<UserSession>>();

async function fetchUserSession() {
    try {
        const payload = await getServerApiClient().get("auth/get-session").json();

        return authSessionSchema.parse(payload);
    } catch (error) {
        // Only "no session" means signed out. Network, 5xx, and parse failures must surface
        // as errors instead of silently logging the user out.
        if (error instanceof ServerApiError && error.statusCode === status.UNAUTHORIZED) {
            return null;
        }

        throw error;
    }
}

export const getUserSession = createServerFn({ method: "GET" }).handler(() => {
    const request = getRequest();
    const cached = sessionLookups.get(request);

    if (cached) return cached;

    const lookup = fetchUserSession();
    sessionLookups.set(request, lookup);
    // A failed lookup must not stick to the request.
    lookup.catch(() => sessionLookups.delete(request));

    return lookup;
});
