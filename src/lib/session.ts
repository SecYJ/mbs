import { isRedirect, redirect } from "@tanstack/react-router";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { count, eq } from "drizzle-orm";

import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { isAdminRole } from "@/lib/roles";

const getServerSession = createServerOnlyFn(async () => {
    const [{ getRequest }, { auth }] = await Promise.all([
        import("@tanstack/react-start/server"),
        import("@/lib/auth"),
    ]);

    const request = getRequest();
    return auth.api.getSession({ headers: request.headers });
});

const ensureSoleUserSuperAdmin = async <Session extends { user: { id: string; role: string } }>(session: Session) => {
    if (isAdminRole(session.user.role)) {
        return session;
    }

    const [existingUsers] = await db.select({ count: count() }).from(userTable);

    if (existingUsers?.count !== 1) {
        return session;
    }

    await db
        .update(userTable)
        .set({ role: "super_admin", updatedAt: new Date() })
        .where(eq(userTable.id, session.user.id));

    return {
        ...session,
        user: {
            ...session.user,
            role: "super_admin",
        },
    };
};

export const getCurrentSession = createServerFn({ method: "GET" }).handler(async () => {
    const session = await getServerSession();

    if (!session) {
        return session;
    }

    return ensureSoleUserSuperAdmin(session);
});

export const redirectAuthenticatedUser = async () => {
    let session = null;

    try {
        session = await getCurrentSession();
    } catch (error) {
        if (isRedirect(error)) {
            throw error;
        }

        throw error;
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

    if (!session || !isAdminRole(session.user.role)) {
        throw redirect({ to: "/login" });
    }

    return session;
};
