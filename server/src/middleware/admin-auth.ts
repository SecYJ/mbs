import { assignableRoles, canManageAccount } from "@mbs/shared/roles";
import { APIError, createAuthMiddleware, getAuthoritativeSessionFromCtx } from "better-auth/api";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// Better Auth's admin plugin exposes account endpoints under `/admin/*` (the BFF calls them through
// `/api/<version>/auth/admin/*`). Its built-in `adminAc` also allows setting any role, impersonating
// users and deleting users, so this file narrows the permissions and adds the target-based rules.

const accessControl = createAccessControl(defaultStatements);

// Every `admin` and `super_admin` permission is listed here. Left out on purpose, so nobody can use
// them: `impersonate`, `impersonate-admins`, `delete` (remove user), `update` and `set-email`
// (update-user could change an account's email or role without the checks below). The matching
// endpoints are also disabled in `lib/auth.ts`.
const managerPermissions = {
    user: ["create", "list", "get", "set-role", "ban", "set-password"],
    session: ["list", "revoke"],
} satisfies Parameters<typeof accessControl.newRole>[0];

export const adminAuthRoles = {
    user: accessControl.newRole({ user: [], session: [] }),
    admin: accessControl.newRole(managerPermissions),
    super_admin: accessControl.newRole(managerPermissions),
};

// Endpoints that act on no particular account. Everything else under `/admin/` needs a manageable target.
const ENDPOINTS_WITHOUT_TARGET = new Set([
    "/admin/list-users",
    "/admin/get-user",
    "/admin/has-permission",
    "/admin/stop-impersonating",
]);

function forbidden(message: string) {
    return new APIError("FORBIDDEN", { message, code: "ACCOUNT_NOT_MANAGEABLE" });
}

function getString(value: unknown) {
    return typeof value === "string" ? value : undefined;
}

// Users read straight from the database adapter are not typed with the admin plugin's `role` field.
function getRole(user: object) {
    return "role" in user && typeof user.role === "string" ? user.role : "user";
}

function getRecord(value: unknown): Record<string, unknown> {
    return typeof value === "object" && value !== null ? Object.fromEntries(Object.entries(value)) : {};
}

// Roles are checked as one plain string: a list such as ["admin", "user"] is stored as "admin,user"
// by the plugin and would slip past the role rules.
function assertAssignableRole(actorRole: string, requestedRole: unknown) {
    const role = getString(requestedRole);

    if (role === undefined || !assignableRoles(actorRole).some((assignable) => assignable === role)) {
        throw forbidden("You are not allowed to assign this role.");
    }
}

export const adminAuthGuard = createAuthMiddleware(async (ctx) => {
    if (!ctx.path.startsWith("/admin/")) return;

    const session = await getAuthoritativeSessionFromCtx(ctx);

    // Without a session the endpoint itself answers 401.
    if (!session) return;

    const actorId = session.user.id;
    const actorRole = session.user.role ?? "user";
    const body = getRecord(ctx.body);

    if (ctx.path === "/admin/create-user") {
        const requestedRole = body.role ?? getRecord(body.data).role;

        // The plugin gives new accounts the `user` role when none is requested.
        if (requestedRole !== undefined) assertAssignableRole(actorRole, requestedRole);
        return;
    }

    if (ENDPOINTS_WITHOUT_TARGET.has(ctx.path)) return;

    // A session is revoked by token, so the account is found through the session.
    const isSessionRevocation = ctx.path === "/admin/revoke-user-session";
    const targetId = isSessionRevocation
        ? (await ctx.context.internalAdapter.findSession(getString(body.sessionToken) ?? ""))?.user.id
        : getString(body.userId);

    // An unknown session token revokes nothing. Any other endpoint without a clear target is refused.
    if (targetId === undefined) {
        if (isSessionRevocation) return;
        throw forbidden("You are not allowed to manage this account.");
    }

    const target = await ctx.context.internalAdapter.findUserById(targetId);

    if (!target) return;

    if (targetId === actorId || !canManageAccount(actorRole, getRole(target))) {
        throw forbidden("You are not allowed to manage this account.");
    }

    if (ctx.path === "/admin/set-role") assertAssignableRole(actorRole, body.role);
});
