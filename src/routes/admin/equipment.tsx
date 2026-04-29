import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { EquipmentPage } from "@/features/admin/pages/equipment-page";
import { equipmentQueryOptions } from "@/features/admin/services/equipment/queries";
import { equipmentSearchDefaults, equipmentSearchSchema } from "@/features/admin/schema/equipment-search.schema";

export const Route = createFileRoute("/admin/equipment")({
    validateSearch: equipmentSearchSchema,
    search: {
        middlewares: [stripSearchParams(equipmentSearchDefaults)],
    },
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(equipmentQueryOptions()),
    component: EquipmentPage,
});
