import { createFileRoute } from "@tanstack/react-router";
import { CompositeComponent } from "@tanstack/react-start/rsc";

import { ForgotPasswordForm } from "@/features/forgot-password/components/ForgotPasswordForm";
import { getForgotPasswordPage } from "@/features/forgot-password/rsc/forgot-password";
import { redirectAuthenticatedUser } from "@/lib/session";

const ForgotPasswordPage = () => {
    const { src } = Route.useLoaderData();

    return (
        <CompositeComponent src={src}>
            <ForgotPasswordForm />
        </CompositeComponent>
    );
};

export const Route = createFileRoute("/_auth/forgot-password")({
    beforeLoad: redirectAuthenticatedUser,
    loader: async () => await getForgotPasswordPage(),
    component: ForgotPasswordPage,
});
