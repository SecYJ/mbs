import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { attendees, bookings, equipment, notifications, roomFacilities, roomEquipment, rooms } from "@/db/schema";
import { createRoomSchema, deleteRoomSchema, updateRoomSchema } from "@/features/admin/schema/room.schema";
import { roomsSearchSchema, type RoomsSearch } from "@/features/admin/schema/rooms-search.schema";
import { isSuperAdminRole } from "@/lib/roles";
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

type DeletedRoomBookingNotification = {
    endTime: Date | string;
    roomLocation: string;
    roomName: string;
    title: string;
    startTime: Date | string;
};

const formatDeletedRoomNotificationDate = (value: Date | string) =>
    new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });

const formatDeletedRoomNotificationTime = (value: Date | string) =>
    new Date(value).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
    });

const getDeletedRoomBookingMessage = (booking: DeletedRoomBookingNotification) =>
    `Room deleted: Your booking "${booking.title}" in ${booking.roomName}, ${booking.roomLocation} on ${formatDeletedRoomNotificationDate(
        booking.startTime,
    )} from ${formatDeletedRoomNotificationTime(booking.startTime)} to ${formatDeletedRoomNotificationTime(
        booking.endTime,
    )} was removed.`;

export const getRoomsFn = createServerFn({ method: "GET" })
    .validator(roomsSearchSchema)
    .handler(async ({ data }) => {
        await requireAdminUser();

        const search = data.q?.trim();
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
    .validator(z.object({ roomId: z.uuid() }))
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
    .validator(createRoomSchema)
    .handler(async ({ data }) => {
        await requireAdminUser();

        const [room] = await db.insert(rooms).values(data).returning();

        return { room };
    });

export const updateRoomFn = createServerFn({ method: "POST" })
    .validator(updateRoomSchema)
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

export const deleteRoomFn = createServerFn({ method: "POST" })
    .validator(deleteRoomSchema)
    .handler(async ({ data }) => {
        const session = await requireAdminUser();

        if (!isSuperAdminRole(session.user.role)) {
            throw new Error("Only super admins can delete rooms.");
        }

        const [room] = await db.transaction(async (tx) => {
            const bookingRows = await tx
                .select({
                    bookingId: bookings.bookingId,
                    endTime: bookings.endTime,
                    roomLocation: rooms.location,
                    roomName: rooms.name,
                    startTime: bookings.startTime,
                    title: bookings.title,
                    userId: bookings.userId,
                })
                .from(bookings)
                .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
                .where(eq(bookings.roomId, data.roomId));
            const bookingIds = bookingRows.map((booking) => booking.bookingId);

            if (bookingIds.length > 0) {
                await tx.insert(notifications).values(
                    bookingRows.map((booking) => ({
                        bookingId: null,
                        userId: booking.userId,
                        message: getDeletedRoomBookingMessage(booking),
                    })),
                );

                await tx.delete(notifications).where(inArray(notifications.bookingId, bookingIds));
                await tx.delete(attendees).where(inArray(attendees.bookingId, bookingIds));
                await tx.delete(bookings).where(eq(bookings.roomId, data.roomId));
            }

            await tx.delete(roomFacilities).where(eq(roomFacilities.roomId, data.roomId));

            return tx.delete(rooms).where(eq(rooms.roomId, data.roomId)).returning();
        });

        if (!room) throw new Error("Room no longer exists");

        return { room };
    });
