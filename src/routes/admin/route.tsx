import { createFileRoute } from "@tanstack/react-router";

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
});
