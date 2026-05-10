import { createFileRoute } from "@tanstack/react-router";

import { EquipmentPage } from "@/features/admin/pages/equipment-page";
import { equipmentQueryOptions } from "@/features/admin/services/equipment/queries";
import { equipmentSearchDefaults, equipmentSearchSchema } from "@/features/admin/schema/equipment-search.schema";
import { stripDefaultSearchParams } from "@/lib/router-search";

export const Route = createFileRoute("/admin/equipment")({
    validateSearch: equipmentSearchSchema,
    search: {
        middlewares: [stripDefaultSearchParams(equipmentSearchDefaults)],
    },
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(equipmentQueryOptions()),
    component: EquipmentPage,
});
