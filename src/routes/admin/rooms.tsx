import { createFileRoute } from "@tanstack/react-router";
import { RoomsPage } from "@/features/admin/pages/rooms-page";

export const Route = createFileRoute("/admin/rooms")({
    component: RoomsPage,
});
