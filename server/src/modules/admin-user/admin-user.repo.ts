import { session, user } from "@mbs/shared/db/schema";
import { asc, desc, eq, max, or, sql } from "drizzle-orm";

import { db } from "#app/db/index";
import { getContainsPattern } from "#app/lib/like-pattern";
import type { AdminUsersQuery } from "#app/modules/admin-user/admin-user.schema";

// Users who never logged in sort as the oldest login.
const lastLoginAtQuery = max(session.createdAt);
const lastLoginSortQuery = sql`coalesce(${lastLoginAtQuery}, '1970-01-01T00:00:00Z'::timestamptz)`;

function getUsersOrderBy({ sort, dir }: AdminUsersQuery) {
    const direction = dir === "asc" ? asc : desc;

    return direction(sort === "lastLogin" ? lastLoginSortQuery : user[sort]);
}

export async function findAdminUsers(input: AdminUsersQuery) {
    const searchPattern = input.q ? getContainsPattern(input.q) : undefined;

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
        .groupBy(user.id)
        .orderBy(getUsersOrderBy(input));
}
