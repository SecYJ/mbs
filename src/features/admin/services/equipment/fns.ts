import { createServerFn } from "@tanstack/react-start";
import { desc } from "drizzle-orm";

import { db } from "@/db";
import { equipment } from "@/db/schema";
import { createEquipmentSchema } from "@/features/admin/schema/equipment.schema";

export const getEquipmentFn = createServerFn({ method: "GET" }).handler(async () => {
    return db.select().from(equipment).orderBy(desc(equipment.createdAt));
});

export const createEquipmentFn = createServerFn({ method: "POST" })
    .inputValidator(createEquipmentSchema)
    .handler(async ({ data }) => {
        const [item] = await db.insert(equipment).values(data).returning();

        return { equipment: item };
    });
