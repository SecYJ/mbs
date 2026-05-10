import { createFileRoute } from "@tanstack/react-router";

import { UsersPage } from "@/features/admin/pages/users-page";
import { usersSearchDefaults, usersSearchSchema } from "@/features/admin/schema/users-search.schema";
import { usersQueryOptions } from "@/features/admin/services/users/queries";
import { stripDefaultSearchParams } from "@/lib/router-search";

export const Route = createFileRoute("/admin/users")({
    validateSearch: usersSearchSchema,
    search: {
        middlewares: [stripDefaultSearchParams(usersSearchDefaults)],
    },
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(usersQueryOptions()),
    component: UsersPage,
});
