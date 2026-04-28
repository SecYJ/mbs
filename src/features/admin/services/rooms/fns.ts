import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { equipment, roomEquipment, rooms } from "@/db/schema";
import { createRoomSchema } from "@/features/admin/schema/room.schema";

export const getRoomsFn = createServerFn({ method: "GET" }).handler(async () => {
    const rows = await db
        .select({
            room: rooms,
            assignmentQuantity: roomEquipment.quantity,
            equipment: equipment,
        })
        .from(rooms)
        .leftJoin(roomEquipment, eq(roomEquipment.roomId, rooms.roomId))
        .leftJoin(equipment, eq(equipment.equipmentId, roomEquipment.equipmentId))
        .orderBy(desc(rooms.createdAt));

    type RoomRow = (typeof rows)[number]["room"];
    type EquipmentLine = {
        id: string;
        name: string;
        brand: string;
        model: string;
        quantity: number;
    };
    const grouped = new Map<string, RoomRow & { equipment: EquipmentLine[] }>();

    for (const row of rows) {
        const existing = grouped.get(row.room.roomId);
        const target = existing ?? { ...row.room, equipment: [] };
        if (!existing) grouped.set(row.room.roomId, target);
        if (row.equipment && row.assignmentQuantity !== null) {
            target.equipment.push({
                id: row.equipment.equipmentId,
                name: row.equipment.name,
                brand: row.equipment.brand,
                model: row.equipment.model,
                quantity: row.assignmentQuantity,
            });
        }
    }

    return Array.from(grouped.values());
});

export const createRoomFn = createServerFn({ method: "POST" })
    .inputValidator(createRoomSchema)
    .handler(async ({ data }) => {
        const [room] = await db.insert(rooms).values(data).returning();

        return { room };
    });
