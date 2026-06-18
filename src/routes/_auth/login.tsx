import { createFileRoute } from "@tanstack/react-router";

import { LoginForm } from "@/features/login/components/LoginForm";
import { LoginShell } from "@/features/login/components/LoginShell";
import { redirectAuthenticatedUser } from "@/lib/session";

export const Route = createFileRoute("/_auth/login")({
    beforeLoad: redirectAuthenticatedUser,
    component: () => {
        return (
            <LoginShell>
                <LoginForm />
            </LoginShell>
        );
    },
});
