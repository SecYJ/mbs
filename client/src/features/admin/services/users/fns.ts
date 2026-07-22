import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { asc, desc, eq, or, sql } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

import { session, user } from "@/db/schema";
import { getDb } from "@/db/server";
import { createUserServerSchema } from "@/features/admin/schema/user.schema";
import { usersSearchSchema, type UsersSearch } from "@/features/admin/schema/users-search.schema";
import { getServerApiClient } from "@/lib/server-api-client";
import { adminUserMiddleware } from "@/middleware/auth";

const toIso = (value: Date | string | null) => (value ? new Date(value).toISOString() : null);
const lastLoginAtQuery = sql<Date | string | null>`max(${session.createdAt})`;
const lastLoginSortQuery = sql<Date | string>`coalesce(max(${session.createdAt}), '1970-01-01T00:00:00Z'::timestamptz)`;

const escapeILike = (value: string) => value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");

const getUsersOrderBy = ({ sort, dir }: Pick<UsersSearch, "sort" | "dir">) => {
    if (!sort || !dir) return desc(user.createdAt);

    const direction = dir === "asc" ? asc : desc;

    if (sort === "lastLogin") return direction(lastLoginSortQuery);

    return direction(user[sort]);
};

export const getUsersFn = createServerFn({ method: "GET" })
    .middleware([adminUserMiddleware])
    .validator(usersSearchSchema)
    .handler(async ({ data }) => {
        const db = await getDb();

        const search = data.q;
        const searchPattern = search ? `%${escapeILike(search)}%` : undefined;
        const where = searchPattern
            ? or(
                  sql`${user.name} ilike ${searchPattern} escape ${"\\"}`,
                  sql`${user.email} ilike ${searchPattern} escape ${"\\"}`,
              )
            : undefined;

        const rows = await db
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
            .where(where)
            .groupBy(user.id, user.name, user.email, user.image, user.role, user.createdAt)
            .orderBy(getUsersOrderBy(data));

        return rows.map((row) => ({
            ...row,
            createdAt: row.createdAt.toISOString(),
            lastLoginAt: toIso(row.lastLoginAt),
        }));
    });

export const createUserByAdminFn = createServerFn({ method: "POST" })
    .middleware([adminUserMiddleware])
    .validator(createUserServerSchema)
    .handler(async ({ data }) => {
        try {
            await getServerApiClient().post("auth/admin/create-user", { json: data }).json();

            setResponseStatus(StatusCodes.CREATED);
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }

            throw new Error("Failed to create user, please try again later.", { cause: err });
        }
    });
