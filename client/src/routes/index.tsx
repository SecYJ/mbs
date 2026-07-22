import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUserSession } from "@/features/auth/services/getUserSession";

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [{ title: "Meridian" }],
    }),
    beforeLoad: async () => {
        const userSession = await getUserSession();

        throw redirect({ to: userSession ? "/bookings" : "/login" });
    },
});
