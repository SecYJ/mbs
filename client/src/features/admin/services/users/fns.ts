import type { UserRole } from "@mbs/shared/roles";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { status } from "http-status";

import { createUserServerSchema } from "@/features/admin/schema/user.schema";
import { usersSearchSchema } from "@/features/admin/schema/users-search.schema";
import { getServerApiClient } from "@/lib/server-api-client";
import { adminUserMiddleware } from "@/middleware/auth";

type AdminUser = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: UserRole;
    createdAt: string;
    lastLoginAt: string | null;
};

export const getUsersFn = createServerFn({ method: "GET" })
    .middleware([adminUserMiddleware])
    .validator(usersSearchSchema)
    .handler(async ({ data }) => {
        return getServerApiClient().get("admin/users", { searchParams: data }).json<AdminUser[]>();
    });

export const createUserByAdminFn = createServerFn({ method: "POST" })
    .middleware([adminUserMiddleware])
    .validator(createUserServerSchema)
    .handler(async ({ data }) => {
        try {
            await getServerApiClient().post("auth/admin/create-user", { json: data }).json();

            setResponseStatus(status.CREATED);
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }

            throw new Error("Failed to create user, please try again later.", { cause: err });
        }
    });
