import { createFileRoute } from "@tanstack/react-router";

import { RulesPage } from "@/features/admin/pages/rules-page";
import { bookingRulesQueryOptions } from "@/features/admin/services/booking-rules/queries";

export const Route = createFileRoute("/admin/rules")({
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(bookingRulesQueryOptions()),
    component: RulesPage,
});
