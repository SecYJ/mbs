import { createFileRoute } from "@tanstack/react-router";

import { AdminLayout } from "@/features/admin/components/admin-layout";
import { requireAdminUser } from "@/lib/session";

export const Route = createFileRoute("/admin")({
    beforeLoad: async () => {
        const session = await requireAdminUser();

        return { user: session.user };
    },
    component: AdminLayout,
});
