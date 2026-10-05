export const USER_ROLES = ["user", "admin", "super_admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS = {
    user: "User",
    admin: "Admin",
    super_admin: "Super Admin",
} satisfies Record<UserRole, string>;

const ADMIN_ROLES = ["admin", "super_admin"] as const;

export function isAdminRole(role: string) {
    return ADMIN_ROLES.some((adminRole) => adminRole === role);
}

export function isSuperAdminRole(role: string) {
    return role === "super_admin";
}

// Roles an actor may manage on other accounts. `super_admin` accounts are never managed through the
// app; they are assigned directly in the database.
const MANAGEABLE_ROLES_BY_ACTOR = {
    admin: ["user"],
    super_admin: ["user", "admin"],
} satisfies Partial<Record<UserRole, readonly UserRole[]>>;

function getManageableRoles(actorRole: string): readonly string[] {
    return Object.entries(MANAGEABLE_ROLES_BY_ACTOR).find(([role]) => role === actorRole)?.[1] ?? [];
}

// Which roles an actor can give when creating an account or changing a role. Nobody can grant `super_admin`.
export function assignableRoles(actorRole: string): UserRole[] {
    return USER_ROLES.filter((role) => getManageableRoles(actorRole).includes(role));
}

// Whether an actor may act on an account (reset password, ban, change role, revoke sessions).
// Unknown roles on either side are never manageable. Callers must also block actions on the actor's own account.
export function canManageAccount(actorRole: string, targetRole: string) {
    return getManageableRoles(actorRole).includes(targetRole);
}
