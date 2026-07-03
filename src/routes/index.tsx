import { createFileRoute, redirect } from "@tanstack/react-router";

import { getCurrentSession } from "@/lib/session";

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [{ title: "Meridian" }],
    }),
    beforeLoad: async () => {
        const session = await getCurrentSession();
        throw redirect({ to: session ? "/bookings" : "/login" });
    },
});
