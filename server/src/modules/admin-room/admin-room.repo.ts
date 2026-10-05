import {
    attendees,
    bookings,
    equipment,
    notifications,
    roomEquipment,
    roomFacilities,
    rooms,
} from "@mbs/shared/db/schema";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import { db, type Database } from "#app/db/index";
import type { AdminRoomInput, AdminRoomQuery } from "#app/modules/admin-room/admin-room.schema";

type RoomEquipment = {
    id: string;
    name: string;
    brand: string;
    model: string;
    quantity: number;
};

const roomFields = {
    roomId: rooms.roomId,
    name: rooms.name,
    location: rooms.location,
    available: rooms.available,
    capacity: rooms.capacity,
    maxBookingDurationHours: rooms.maxBookingDurationHours,
    createdAt: rooms.createdAt,
    updatedAt: rooms.updatedAt,
};

const equipmentByRoom = db
    .select({
        roomId: roomEquipment.roomId,
        items: sql<RoomEquipment[]>`json_agg(json_build_object(
            'id', ${equipment.equipmentId},
            'name', ${equipment.name},
            'brand', ${equipment.brand},
            'model', ${equipment.model},
            'quantity', ${roomEquipment.quantity}
        ) order by ${equipment.equipmentId})`.as("items"),
    })
    .from(roomEquipment)
    .innerJoin(equipment, eq(equipment.equipmentId, roomEquipment.equipmentId))
    .groupBy(roomEquipment.roomId)
    .as("equipment_by_room");

function selectRoomsWithEquipment() {
    return db
        .select({
            ...roomFields,
            equipment: sql<RoomEquipment[]>`coalesce(${equipmentByRoom.items}, '[]'::json)`,
        })
        .from(rooms)
        .leftJoin(equipmentByRoom, eq(equipmentByRoom.roomId, rooms.roomId));
}

function getRoomsOrderBy(sort: AdminRoomQuery["sort"]) {
    if (sort === "name-asc") return [asc(rooms.name)];
    if (sort === "name-desc") return [desc(rooms.name)];
    if (sort === "capacity-desc") return [desc(rooms.capacity), asc(rooms.name)];
    if (sort === "capacity-asc") return [asc(rooms.capacity), asc(rooms.name)];
    if (sort === "duration-desc") return [desc(rooms.maxBookingDurationHours), asc(rooms.name)];
    if (sort === "duration-asc") return [asc(rooms.maxBookingDurationHours), asc(rooms.name)];

    return [desc(rooms.createdAt)];
}

export function listAdminRooms(query: AdminRoomQuery) {
    const search = query.q?.trim();

    return selectRoomsWithEquipment()
        .where(
            and(
                search ? or(ilike(rooms.name, `%${search}%`), ilike(rooms.location, `%${search}%`)) : undefined,
                query.status === "available" ? eq(rooms.available, true) : undefined,
                query.status === "disabled" ? eq(rooms.available, false) : undefined,
            ),
        )
        .orderBy(...getRoomsOrderBy(query.sort));
}

export async function findAdminRoom(roomId: string) {
    const result = await selectRoomsWithEquipment().where(eq(rooms.roomId, roomId));

    return result.at(0) ?? null;
}

export async function insertAdminRoom(input: AdminRoomInput) {
    const [room] = await db.insert(rooms).values(input).returning(roomFields);
    return room;
}

export async function updateAdminRoom(roomId: string, input: AdminRoomInput) {
    const [room] = await db
        .update(rooms)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(rooms.roomId, roomId))
        .returning(roomFields);
    return room;
}

export async function findAdminRoomForDeletion(roomId: string, database: Database) {
    const [room] = await database.select(roomFields).from(rooms).where(eq(rooms.roomId, roomId)).for("update");
    return room;
}

export function listRoomBookingsForDeletion(roomId: string, database: Database) {
    return database
        .select({
            endTime: bookings.endTime,
            startTime: bookings.startTime,
            title: bookings.title,
            userId: bookings.userId,
        })
        .from(bookings)
        .where(eq(bookings.roomId, roomId))
        .for("update");
}

export function insertDeletedRoomNotifications(messages: { userId: string; message: string }[], database: Database) {
    return database.insert(notifications).values(messages);
}

export async function deleteAdminRoom(roomId: string, database: Database) {
    const roomBookings = database
        .select({ bookingId: bookings.bookingId })
        .from(bookings)
        .where(eq(bookings.roomId, roomId));

    await database.delete(notifications).where(inArray(notifications.bookingId, roomBookings));
    await database.delete(attendees).where(inArray(attendees.bookingId, roomBookings));
    await database.delete(bookings).where(eq(bookings.roomId, roomId));
    await database.delete(roomFacilities).where(eq(roomFacilities.roomId, roomId));
    await database.delete(roomEquipment).where(eq(roomEquipment.roomId, roomId));
    await database.delete(rooms).where(eq(rooms.roomId, roomId));
}
