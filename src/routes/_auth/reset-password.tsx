import { createFileRoute } from "@tanstack/react-router";
import { CompositeComponent } from "@tanstack/react-start/rsc";
import { z } from "zod";

import { ResetPasswordForm } from "@/features/reset-password/components/ResetPasswordForm";
import { getResetPasswordPage } from "@/features/reset-password/rsc/ResetPassword";
import { redirectAuthenticatedUser } from "@/lib/session";

const resetPasswordSearchSchema = z.object({
    token: z.string().optional(),
    error: z.string().optional(),
});

export const ResetPasswordPage = () => {
    const { src } = Route.useLoaderData();
    const { token, error } = Route.useSearch();

    return (
        <CompositeComponent src={src}>
            <ResetPasswordForm token={token} error={error} />
        </CompositeComponent>
    );
};

// react-doctor-disable-next-line react-doctor/only-export-components -- TanStack file routes must export Route.
export const Route = createFileRoute("/_auth/reset-password")({
    validateSearch: resetPasswordSearchSchema,
    beforeLoad: redirectAuthenticatedUser,
    loader: async () => await getResetPasswordPage(),
    component: ResetPasswordPage,
});
