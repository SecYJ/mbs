import { redirect } from "@tanstack/react-router";

import { getUserSession } from "@/features/auth/services/getUserSession";
import { isAdminRole } from "@/lib/roles";

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

    if (!session || !isAdminRole(session.user.role)) {
        throw redirect({ to: "/login" });
    }

    return session;
};
