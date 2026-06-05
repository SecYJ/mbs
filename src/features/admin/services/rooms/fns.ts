import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { equipment, roomEquipment, rooms } from "@/db/schema";
import { createRoomSchema, updateRoomSchema } from "@/features/admin/schema/room.schema";
import { roomsSearchSchema, type RoomsSearch } from "@/features/admin/schema/rooms-search.schema";
import { requireAdminUser } from "@/lib/session";

const getRoomsOrderBy = (sort: RoomsSearch["sort"]) => {
    if (sort === "name-asc") return [asc(rooms.name)];
    if (sort === "name-desc") return [desc(rooms.name)];
    if (sort === "capacity-desc") return [desc(rooms.capacity), asc(rooms.name)];
    if (sort === "capacity-asc") return [asc(rooms.capacity), asc(rooms.name)];
    if (sort === "duration-desc") return [desc(rooms.maxBookingDurationHours), asc(rooms.name)];
    if (sort === "duration-asc") return [asc(rooms.maxBookingDurationHours), asc(rooms.name)];

    return [desc(rooms.createdAt)];
};

export const getRoomsFn = createServerFn({ method: "GET" })
    .inputValidator(roomsSearchSchema)
    .handler(async ({ data }) => {
        await requireAdminUser();

        const search = data.q.trim();
        const whereConditions: SQL[] = [];

        if (search) {
            const pattern = `%${search}%`;
            const searchCondition = or(ilike(rooms.name, pattern), ilike(rooms.location, pattern));
            if (searchCondition) whereConditions.push(searchCondition);
        }

        if (data.status === "available") whereConditions.push(eq(rooms.available, true));
        if (data.status === "disabled") whereConditions.push(eq(rooms.available, false));

        const rows = await db
            .select({
                room: rooms,
                assignmentQuantity: roomEquipment.quantity,
                equipment: equipment,
            })
            .from(rooms)
            .leftJoin(roomEquipment, eq(roomEquipment.roomId, rooms.roomId))
            .leftJoin(equipment, eq(equipment.equipmentId, roomEquipment.equipmentId))
            .where(and(...whereConditions))
            .orderBy(...getRoomsOrderBy(data.sort));

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

export const getRoomFn = createServerFn({ method: "GET" })
    .inputValidator(z.object({ roomId: z.uuid() }))
    .handler(async ({ data }) => {
        await requireAdminUser();

        const rows = await db
            .select({
                room: rooms,
                assignmentQuantity: roomEquipment.quantity,
                equipment: equipment,
            })
            .from(rooms)
            .leftJoin(roomEquipment, eq(roomEquipment.roomId, rooms.roomId))
            .leftJoin(equipment, eq(equipment.equipmentId, roomEquipment.equipmentId))
            .where(eq(rooms.roomId, data.roomId));

        const firstRow = rows[0];
        if (!firstRow) return null;

        return {
            ...firstRow.room,
            equipment: rows.flatMap((row) =>
                row.equipment && row.assignmentQuantity !== null
                    ? [
                          {
                              id: row.equipment.equipmentId,
                              name: row.equipment.name,
                              brand: row.equipment.brand,
                              model: row.equipment.model,
                              quantity: row.assignmentQuantity,
                          },
                      ]
                    : [],
            ),
        };
    });

export const createRoomFn = createServerFn({ method: "POST" })
    .inputValidator(createRoomSchema)
    .handler(async ({ data }) => {
        await requireAdminUser();

        const [room] = await db.insert(rooms).values(data).returning();

        return { room };
    });

export const updateRoomFn = createServerFn({ method: "POST" })
    .inputValidator(updateRoomSchema)
    .handler(async ({ data }) => {
        await requireAdminUser();

        const [room] = await db
            .update(rooms)
            .set({
                name: data.name,
                location: data.location,
                capacity: data.capacity,
                maxBookingDurationHours: data.maxBookingDurationHours,
                available: data.available,
                updatedAt: new Date(),
            })
            .where(eq(rooms.roomId, data.roomId))
            .returning();

        if (!room) throw new Error("Room no longer exists");

        return { room };
    });
