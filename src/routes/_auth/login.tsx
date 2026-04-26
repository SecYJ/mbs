import { createFileRoute } from "@tanstack/react-router";
import { CompositeComponent } from "@tanstack/react-start/rsc";

import { LoginForm } from "@/features/login/components/LoginForm";
import { getLoginPage } from "@/features/login/rsc/login";
import { redirectAuthenticatedUser } from "@/lib/session";

export const Route = createFileRoute("/_auth/login")({
    beforeLoad: redirectAuthenticatedUser,
    loader: async () => await getLoginPage(),
    component: LoginPage,
});

function LoginPage() {
    const { src } = Route.useLoaderData();

    return (
        <CompositeComponent src={src}>
            <LoginForm />
        </CompositeComponent>
    );
}
