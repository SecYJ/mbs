import { createFileRoute } from "@tanstack/react-router";
import { BookingsPage } from "@/features/admin/pages/bookings-page";

export const Route = createFileRoute("/admin/bookings")({
    component: BookingsPage,
});
