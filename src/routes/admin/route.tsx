import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { AdminLayout } from "@/features/admin/components/admin-layout";
import { authClient } from "@/lib/auth-client";
import { requireAuthenticatedUser } from "@/lib/session";

const AdminRoute = () => {
    const { user } = Route.useLoaderData();
    const queryClient = useQueryClient();
    const navigate = useNavigate({ from: "/admin" });
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut();
        queryClient.clear();
        await router.invalidate();
        navigate({ to: "/login" });
    };

    return <AdminLayout user={user} onSignOut={handleSignOut} />;
};

export const Route = createFileRoute("/admin")({
    beforeLoad: async () => ({ session: await requireAuthenticatedUser() }),
    loader: ({ context }) => context.session,
    component: AdminRoute,
});
