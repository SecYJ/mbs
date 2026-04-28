import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { AdminLayout } from "@/features/admin/components/admin-layout";
import { authClient } from "@/lib/auth-client";
import { requireAdminUser } from "@/lib/session";

const AdminRoute = () => {
    const session = Route.useLoaderData();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut();
        queryClient.clear();
        await router.invalidate();
        navigate({ to: "/login" });
    };

    return <AdminLayout user={session.user} onSignOut={handleSignOut} />;
};

export const Route = createFileRoute("/admin")({
    beforeLoad: async () => ({ session: await requireAdminUser() }),
    loader: ({ context }) => context.session,
    component: AdminRoute,
});
