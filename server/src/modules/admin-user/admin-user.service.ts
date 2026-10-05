import { findAdminUsers } from "#app/modules/admin-user/admin-user.repo";
import type { AdminUsersQuery } from "#app/modules/admin-user/admin-user.schema";

export async function getAdminUsersService(input: AdminUsersQuery) {
    const users = await findAdminUsers(input);

    return users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    }));
}
