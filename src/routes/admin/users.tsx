import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { AdminPending } from "@/features/admin/components/AdminPending";
import { UsersPage } from "@/features/admin/pages/UsersPage";
import { usersSearchDefaults, usersSearchSchema } from "@/features/admin/schema/users-search.schema";
import { usersQueryOptions } from "@/features/admin/services/users/queries";

export const Route = createFileRoute("/admin/users")({
    validateSearch: usersSearchSchema,
    search: {
        middlewares: [stripSearchParams(usersSearchDefaults)],
    },
    loaderDeps: (loaderDeps) => loaderDeps.search,
    loader: ({ context: { queryClient }, deps }) => {
        queryClient.ensureQueryData(usersQueryOptions(deps));
    },
    component: UsersPage,
    pendingComponent: AdminPending,
});
