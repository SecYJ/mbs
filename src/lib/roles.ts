export const USER_ROLES = ["user", "admin", "super_admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS = {
    user: "User",
    admin: "Admin",
    super_admin: "Super Admin",
} satisfies Record<UserRole, string>;

const ADMIN_ROLES = ["admin", "super_admin"] as const;

export const isAdminRole = (role: string) => ADMIN_ROLES.some((adminRole) => adminRole === role);

export const isSuperAdminRole = (role: string) => role === "super_admin";
