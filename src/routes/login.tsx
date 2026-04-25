import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "@/features/login/components/LoginPage";
import { redirectAuthenticatedUser } from "@/lib/session";

export const Route = createFileRoute("/login")({
    beforeLoad: redirectAuthenticatedUser,
    ssr: "data-only",
    component: LoginPage,
});
