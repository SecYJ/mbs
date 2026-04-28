import { and, eq, notInArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { equipment, roomEquipment, rooms } from "@/db/schema";

const findRoom = async (name: string) => {
    const [row] = await db.select().from(rooms).where(eq(rooms.name, name));
    if (!row) throw new Error(`Room not found: ${name}`);
    return row;
};

const findEquipment = async (brand: string, model: string) => {
    const [row] = await db
        .select()
        .from(equipment)
        .where(and(eq(equipment.brand, brand), eq(equipment.model, model)));
    if (!row) throw new Error(`Equipment not found: ${brand} ${model}`);
    return row;
};

type Assignment = {
    roomName: string;
    items: { brand: string; model: string; quantity: number }[];
};

// Room 33A — 1st floor, capacity 25 (larger room → 75" TV, laser projector, larger AC + whiteboard)
// Room 35B — 3rd floor, capacity 20 (smaller → 65" TV, mid-range projector)
// Items NOT listed here remain unassigned in inventory for future rooms:
//   TVs: Samsung QM55C, LG 65UR640S9UD, Philips 65BFL2214/27, Philips 75BDL3550Q
//   Projectors: Epson EB-W49
//   Air conditioners: Panasonic CS-PU10VKH, Samsung AR12TYHYEWKNST
//   Whiteboards: U Brands 2825U00-01, Luxor MB4836WW, Office Depot OD-WB23
//   Chairs: 5 of the 50 IKEA TEODORES (25 + 20 = 45 assigned)
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

const reset = process.argv.includes("--reset");

for (const { roomName, items } of assignments) {
    const room = await findRoom(roomName);
    const rows = await Promise.all(
        items.map(async (it) => {
            const equip = await findEquipment(it.brand, it.model);
            return { roomId: room.roomId, equipmentId: equip.equipmentId, quantity: it.quantity };
        }),
    );

    await db.transaction(async (tx) => {
        if (reset) {
            const removed = await tx
                .delete(roomEquipment)
                .where(eq(roomEquipment.roomId, room.roomId))
                .returning();
            console.log(`[${roomName}] reset deleted ${removed.length} assignments`);
        } else if (rows.length > 0) {
            await tx
                .delete(roomEquipment)
                .where(
                    and(
                        eq(roomEquipment.roomId, room.roomId),
                        notInArray(roomEquipment.equipmentId, rows.map((r) => r.equipmentId)),
                    ),
                );
        } else {
            await tx.delete(roomEquipment).where(eq(roomEquipment.roomId, room.roomId));
        }
        const inserted = await tx
            .insert(roomEquipment)
            .values(rows)
            .onConflictDoUpdate({
                target: [roomEquipment.roomId, roomEquipment.equipmentId],
                set: { quantity: sql`excluded.quantity` },
            })
            .returning();
        console.log(`[${roomName}] upserted ${inserted.length} equipment line(s)`);
    });
}

process.exit(0);
