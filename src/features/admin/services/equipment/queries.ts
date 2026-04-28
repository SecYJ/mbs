import { queryOptions } from "@tanstack/react-query";

import { getEquipmentFn } from "@/features/admin/services/equipment/fns";
import type { Equipment } from "@/features/admin/types";

export const equipmentQueryOptions = () =>
    queryOptions({
        queryKey: ["admin", "equipment"],
        queryFn: getEquipmentFn,
        select: (rows) =>
            rows.map<Equipment>((row) => ({
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
