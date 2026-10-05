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
