import { createFileRoute } from "@tanstack/react-router";

import { AppPending } from "@/components/AppPending";
import { DefaultError } from "@/components/DefaultError";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { requireAdminUser } from "@/lib/session";

export const Route = createFileRoute("/admin")({
    head: () => ({
        meta: [{ title: "Admin | Meridian" }],
    }),
    beforeLoad: async () => {
        const session = await requireAdminUser();

        return { user: session.user };
    },
    component: AdminLayout,
    pendingComponent: AppPending,
    errorComponent: DefaultError,
});
