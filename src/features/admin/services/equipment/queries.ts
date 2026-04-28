import { queryOptions } from "@tanstack/react-query";

import type { Equipment } from "@/features/admin/components/equipment-row";
import { getEquipmentFn } from "@/features/admin/services/equipment/fns";

export const equipmentQueryOptions = () =>
    queryOptions({
        queryKey: ["admin", "equipment"],
        queryFn: getEquipmentFn,
        select: (rows): Equipment[] =>
            rows.map((row) => ({
                id: row.equipmentId,
                name: row.name,
                brand: row.brand,
                model: row.model,
                price: row.price,
                quantity: row.quantity,
                purchaseDate: row.purchaseDate,
                warrantyExpiry: row.warrantyExpiry,
            })),
    });
