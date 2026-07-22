import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
    head: () => ({
        meta: [{ title: "Admin | Meridian" }],
    }),
    beforeLoad: () => {
        throw redirect({ to: "/admin/rooms" });
    },
});
