import { hashPassword } from "better-auth/crypto";
import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq, or, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

import { db } from "@/db";
import { account, session, user } from "@/db/schema";
import { createUserServerSchema } from "@/features/admin/schema/user.schema";
import { usersSearchSchema, type UsersSearch } from "@/features/admin/schema/users-search.schema";
import { requireAdminUser } from "@/lib/session";
import { isSuperAdminRole } from "@/lib/roles";

const toIso = (value: Date | string | null) => (value ? new Date(value).toISOString() : null);
const lastLoginAtQuery = sql<Date | string | null>`max(${session.createdAt})`;
const lastLoginSortQuery = sql<Date | string>`coalesce(max(${session.createdAt}), '1970-01-01T00:00:00Z'::timestamptz)`;

const PG_UNIQUE_VIOLATION = "23505";

const escapeILike = (value: string) => value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");

const isUniqueViolation = (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === PG_UNIQUE_VIOLATION;

const getUsersOrderBy = ({ sort, dir }: Pick<UsersSearch, "sort" | "dir">) => {
    if (!sort || !dir) return desc(user.createdAt);

    const direction = dir === "asc" ? asc : desc;

    if (sort === "lastLogin") return direction(lastLoginSortQuery);

    return direction(user[sort]);
};

export const getUsersFn = createServerFn({ method: "GET" })
    .validator(usersSearchSchema)
    .handler(async ({ data }) => {
        await requireAdminUser();

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

export const createUserFn = createServerFn({ method: "POST" })
    .validator(createUserServerSchema)
    .handler(async ({ data }) => {
        const currentSession = await requireAdminUser();

        if (data.role === "super_admin" && !isSuperAdminRole(currentSession.user.role)) {
            throw new Error("Only super admins can create super admins");
        }

        const email = data.email.toLowerCase();
        const password = await hashPassword(data.password);
        const userId = uuidv7();

        try {
            const createdUser = await db.transaction(async (tx) => {
                const [created] = await tx
                    .insert(user)
                    .values({
                        id: userId,
                        name: data.name,
                        email,
                        emailVerified: false,
                        role: data.role,
                    })
                    .returning();

                if (!created) {
                    throw new Error("Failed to create user");
                }

                await tx.insert(account).values({
                    id: uuidv7(),
                    accountId: userId,
                    providerId: "credential",
                    userId,
                    password,
                });

                return created;
            });

            return {
                user: {
                    ...createdUser,
                    createdAt: createdUser.createdAt.toISOString(),
                    updatedAt: createdUser.updatedAt.toISOString(),
                },
            };
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new Error("A user with this email already exists", { cause: error });
            }
            throw error;
        }
    });
