import { hashPassword } from "better-auth/crypto";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

import { db } from "@/db";
import { account, session, user } from "@/db/schema";
import { createUserServerSchema } from "@/features/admin/schema/user.schema";

const toIso = (value: Date | string | null) => (value ? new Date(value).toISOString() : null);

export const getUsersFn = createServerFn({ method: "GET" }).handler(async () => {
    const rows = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: user.createdAt,
            lastLoginAt: sql<Date | string | null>`max(${session.createdAt})`,
        })
        .from(user)
        .leftJoin(session, eq(session.userId, user.id))
        .groupBy(user.id, user.name, user.email, user.image, user.createdAt)
        .orderBy(desc(user.createdAt));

    return rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        lastLoginAt: toIso(row.lastLoginAt),
    }));
});

export const createUserFn = createServerFn({ method: "POST" })
    .inputValidator(createUserServerSchema)
    .handler(async ({ data }) => {
        const email = data.email.toLowerCase();
        const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);

        if (existing.length > 0) {
            throw new Error("A user with this email already exists");
        }

        const password = await hashPassword(data.password);
        const userId = uuidv7();

        const createdUser = await db.transaction(async (tx) => {
            const [created] = await tx
                .insert(user)
                .values({
                    id: userId,
                    name: data.name,
                    email,
                    emailVerified: false,
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
    });
