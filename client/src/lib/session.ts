import { isAdminRole } from "@mbs/shared/roles";
import { redirect } from "@tanstack/react-router";

import { getUserSession } from "@/features/auth/services/getUserSession";

export const redirectAuthenticatedUser = async () => {
    const session = await getUserSession();

    if (session) {
        throw redirect({ to: "/bookings" });
    }
};

export const requireAuthenticatedUser = async () => {
    const session = await getUserSession();

    if (!session) {
        throw redirect({ to: "/login" });
    }

    return session;
};

export const requireAdminUser = async () => {
    const session = await getUserSession();

    if (!session) {
        throw redirect({ to: "/login" });
    }

    if (!isAdminRole(session.user.role)) {
        throw redirect({ to: "/bookings" });
    }

    return session;
};
