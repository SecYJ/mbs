import { createFileRoute } from "@tanstack/react-router";

import { SettingsPage } from "@/features/settings/pages/SettingsPage";

// react-doctor-disable-next-line react-doctor/only-export-components -- TanStack file routes must export Route.
export const Route = createFileRoute("/_bookings/settings")({
    component: SettingsPage,
});
