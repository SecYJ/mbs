import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { equipment, roomEquipment, rooms } from "@/db/schema";

const findRoom = async (name: string) => {
    const [row] = await db.select().from(rooms).where(eq(rooms.name, name));
    if (!row) throw new Error(`Room not found: ${name}`);
    return row;
};

const findEquipment = async (brand: string, model: string) => {
    const rows = await db
        .select()
        .from(equipment)
        .where(and(eq(equipment.brand, brand), eq(equipment.model, model)));
    if (rows.length === 0) throw new Error(`Equipment not found: ${brand} ${model}`);
    if (rows.length > 1) throw new Error(`Equipment lookup is ambiguous: ${brand} ${model}`);
    return rows[0];
};

type Assignment = {
    roomName: string;
    items: { brand: string; model: string; quantity: number }[];
};

// Equipment is assigned through room_equipment. Rooms no longer own equipment-specific columns.
// Items not listed here remain unassigned in inventory for future rooms.
const assignments: Assignment[] = [
    {
        roomName: "33A",
        items: [
            { brand: "LG", model: "75UR340C9UD", quantity: 1 },
            { brand: "Panasonic", model: "PT-VMW60", quantity: 1 },
            { brand: "Daikin", model: "FTKM35QV2S", quantity: 1 },
            { brand: "Quartet", model: "S537", quantity: 1 },
            { brand: "IKEA", model: "TEODORES", quantity: 25 },
        ],
    },
    {
        roomName: "35B",
        items: [
            { brand: "Samsung", model: "BE65C-H", quantity: 1 },
            { brand: "BenQ", model: "MW560", quantity: 1 },
            { brand: "Mitsubishi", model: "MSY-GN18VF", quantity: 1 },
            { brand: "Quartet", model: "SM534", quantity: 1 },
            { brand: "IKEA", model: "TEODORES", quantity: 20 },
        ],
    },
];

for (const { roomName, items } of assignments) {
    const room = await findRoom(roomName);
    const rows = await Promise.all(
        items.map(async (it) => {
            const equip = await findEquipment(it.brand, it.model);
            if (it.quantity > equip.quantity) {
                throw new Error(
                    `Assignment exceeds inventory for ${it.brand} ${it.model}: requested ${it.quantity}, available ${equip.quantity}`,
                );
            }

            return { roomId: room.roomId, equipmentId: equip.equipmentId, quantity: it.quantity };
        }),
    );

    await db.transaction(async (tx) => {
        const removed = await tx.delete(roomEquipment).where(eq(roomEquipment.roomId, room.roomId)).returning();
        const inserted = await tx
            .insert(roomEquipment)
            .values(rows)
            .onConflictDoUpdate({
                target: [roomEquipment.roomId, roomEquipment.equipmentId],
                set: { quantity: sql`excluded.quantity`, updatedAt: sql`now()` },
            })
            .returning();
        console.log(
            `[${roomName}] replaced ${removed.length} assignment(s), seeded ${inserted.length} equipment line(s)`,
        );
    });
}

process.exit(0);
