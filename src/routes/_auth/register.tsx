import { createFileRoute } from "@tanstack/react-router";

import { RegisterForm } from "@/features/register/components/RegisterForm";
import { RegisterShell } from "@/features/register/components/RegisterShell";
import { redirectAuthenticatedUser } from "@/lib/session";

export const Route = createFileRoute("/_auth/register")({
    head: () => ({
        meta: [{ title: "Register | Meridian" }],
    }),
    beforeLoad: redirectAuthenticatedUser,
    component: () => {
        return (
            <RegisterShell>
                <RegisterForm />
            </RegisterShell>
        );
    },
});
