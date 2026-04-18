import { createFileRoute } from "@tanstack/react-router";
import { RulesPage } from "@/features/admin/pages/rules-page";

export const Route = createFileRoute("/admin/rules")({
	component: RulesPage,
});
