import { createFileRoute } from "@tanstack/react-router";

import { SettingsPage } from "@/features/settings/pages/SettingsPage";

export const Route = createFileRoute("/_bookings/settings")({
    component: SettingsPage,
});
