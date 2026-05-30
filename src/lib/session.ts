import { isRedirect, redirect } from "@tanstack/react-router";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";

const getServerSession = createServerOnlyFn(async () => {
    const [{ getRequest }, { auth }] = await Promise.all([
        import("@tanstack/react-start/server"),
        import("@/lib/auth"),
    ]);

    const request = getRequest();
    return auth.api.getSession({ headers: request.headers });
});

export const getCurrentSession = createServerFn({ method: "GET" }).handler(async () => {
    return getServerSession();
});

export const redirectAuthenticatedUser = async () => {
    let session = null;

    try {
        session = await getCurrentSession();
    } catch (error) {
        if (isRedirect(error)) {
            throw error;
        }
    }

    if (session) {
        throw redirect({ to: "/bookings" });
    }
};

export const requireAuthenticatedUser = async () => {
    const session = await getCurrentSession();

    if (!session) {
        throw redirect({ to: "/login" });
    }

    return session;
};

export const requireAdminUser = async () => {
    const session = await getCurrentSession();

    if (!session || session.user.role !== "admin") {
        throw redirect({ to: "/login" });
    }

    return session;
};
