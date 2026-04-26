import { createFileRoute } from "@tanstack/react-router";
import { CompositeComponent } from "@tanstack/react-start/rsc";
import { z } from "zod";

import { ResetPasswordForm } from "@/features/reset-password/components/ResetPasswordForm";
import { getResetPasswordPage } from "@/features/reset-password/rsc/reset-password";
import { redirectAuthenticatedUser } from "@/lib/session";

const resetPasswordSearchSchema = z.object({
    token: z.string().optional(),
    error: z.string().optional(),
});

const ResetPasswordPage = () => {
    const { src } = Route.useLoaderData();
    const { token, error } = Route.useSearch();

    return (
        <CompositeComponent src={src}>
            <ResetPasswordForm token={token} error={error} />
        </CompositeComponent>
    );
};

export const Route = createFileRoute("/_auth/reset-password")({
    beforeLoad: redirectAuthenticatedUser,
    validateSearch: resetPasswordSearchSchema,
    loader: async () => await getResetPasswordPage(),
    component: ResetPasswordPage,
});
