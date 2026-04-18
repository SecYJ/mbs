import { createFileRoute } from "@tanstack/react-router";
import { EquipmentPage } from "@/features/admin/pages/equipment-page";

export const Route = createFileRoute("/admin/equipment")({
	component: EquipmentPage,
});
