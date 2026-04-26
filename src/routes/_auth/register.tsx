import { createFileRoute } from "@tanstack/react-router";
import { CompositeComponent } from "@tanstack/react-start/rsc";

import { RegisterForm } from "@/features/register/components/RegisterForm";
import { getRegisterPage } from "@/features/register/rsc/register";
import { redirectAuthenticatedUser } from "@/lib/session";

export const Route = createFileRoute("/_auth/register")({
    beforeLoad: redirectAuthenticatedUser,
    loader: async () => await getRegisterPage(),
    component: RegisterPage,
});

function RegisterPage() {
    const { src } = Route.useLoaderData();

    return (
        <CompositeComponent src={src}>
            <RegisterForm />
        </CompositeComponent>
    );
}
