import { session, user } from "@mbs/shared/db/schema";
import { asc, desc, eq, or, sql } from "drizzle-orm";

import { db } from "#app/db/index";
import type { AdminUsersQuery } from "#app/modules/admin-user/admin-user.schema";

const lastLoginAtQuery = sql<Date | string | null>`max(${session.createdAt})`;
const lastLoginSortQuery = sql`coalesce(max(${session.createdAt}), '1970-01-01T00:00:00Z'::timestamptz)`;

function getUsersOrderBy({ sort, dir }: AdminUsersQuery) {
    const direction = dir === "asc" ? asc : desc;

    return direction(sort === "lastLogin" ? lastLoginSortQuery : user[sort]);
}

export async function findAdminUsers(input: AdminUsersQuery) {
    const searchPattern = input.q
        ? `%${input.q.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_")}%`
        : undefined;

    return db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            createdAt: user.createdAt,
            lastLoginAt: lastLoginAtQuery,
        })
        .from(user)
        .leftJoin(session, eq(session.userId, user.id))
        .where(
            searchPattern
                ? or(
                      sql`${user.name} ilike ${searchPattern} escape ${"\\"}`,
                      sql`${user.email} ilike ${searchPattern} escape ${"\\"}`,
                  )
                : undefined,
        )
        .groupBy(user.id, user.name, user.email, user.image, user.role, user.createdAt)
        .orderBy(getUsersOrderBy(input));
}
