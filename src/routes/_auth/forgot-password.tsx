import { createFileRoute } from "@tanstack/react-router";

import { ForgotPasswordForm } from "@/features/forgot-password/components/ForgotPasswordForm";
import { ForgotPasswordShell } from "@/features/forgot-password/components/ForgotPasswordShell";
import { redirectAuthenticatedUser } from "@/lib/session";

export const Route = createFileRoute("/_auth/forgot-password")({
    head: () => ({
        meta: [{ title: "Forgot Password | Meridian" }],
    }),
    beforeLoad: redirectAuthenticatedUser,
    component: () => {
        return (
            <ForgotPasswordShell>
                <ForgotPasswordForm />
            </ForgotPasswordShell>
        );
    },
});
