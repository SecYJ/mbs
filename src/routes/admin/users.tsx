import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/features/admin/pages/users-page";

export const Route = createFileRoute("/admin/users")({
    component: UsersPage,
});
