import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ResetPasswordForm } from "@/features/reset-password/components/ResetPasswordForm";
import { ResetPasswordShell } from "@/features/reset-password/components/ResetPasswordShell";
import { redirectAuthenticatedUser } from "@/lib/session";

const resetPasswordSearchSchema = z.object({
    token: z.string().optional(),
});

export const Route = createFileRoute("/_auth/reset-password")({
    head: () => ({
        meta: [{ title: "Reset Password | Meridian" }],
    }),
    validateSearch: resetPasswordSearchSchema,
    beforeLoad: redirectAuthenticatedUser,
    component: ResetPasswordPage,
});

function ResetPasswordPage() {
    const { token } = Route.useSearch();

    return (
        <ResetPasswordShell>
            <ResetPasswordForm token={token} />
        </ResetPasswordShell>
    );
}
