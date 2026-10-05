import { isSuperAdminRole } from "@mbs/shared/roles";

import { db } from "#app/db/index";
import { ForbiddenError } from "#app/errors/forbiddenError";
import { NotFoundError } from "#app/errors/notFoundError";
import {
    deleteAdminRoom,
    findAdminRoom,
    findAdminRoomForDeletion,
    insertAdminRoom,
    insertDeletedRoomNotifications,
    listAdminRooms,
    listRoomBookingsForDeletion,
    updateAdminRoom,
} from "#app/modules/admin-room/admin-room.repo";
import type { AdminRoomInput, AdminRoomQuery } from "#app/modules/admin-room/admin-room.schema";
import { formatBookingSlot } from "#app/modules/booking/booking.format";

function serializeRoom<T extends { createdAt: Date | null; updatedAt: Date | null }>(room: T) {
    const { createdAt, updatedAt, ...fields } = room;
    return {
        ...fields,
        createdAt: createdAt?.toISOString() ?? null,
        updatedAt: updatedAt?.toISOString() ?? null,
    };
}

export async function getAdminRoomsService(query: AdminRoomQuery) {
    const rooms = await listAdminRooms(query);
    return rooms.map(serializeRoom);
}

export async function getAdminRoomService(roomId: string) {
    const room = await findAdminRoom(roomId);
    if (!room) throw new NotFoundError("Room no longer exists");
    return serializeRoom(room);
}

export async function createAdminRoomService(input: AdminRoomInput) {
    const room = await insertAdminRoom(input);
    return { room: serializeRoom(room) };
}

export async function updateAdminRoomService(roomId: string, input: AdminRoomInput) {
    const room = await updateAdminRoom(roomId, input);
    if (!room) throw new NotFoundError("Room no longer exists");
    return { room: serializeRoom(room) };
}

export async function deleteAdminRoomService(roomId: string, userRole: string) {
    if (!isSuperAdminRole(userRole)) {
        throw new ForbiddenError("Only super admins can delete rooms.");
    }

    const room = await db.transaction(async (tx) => {
        const existingRoom = await findAdminRoomForDeletion(roomId, tx);
        if (!existingRoom) throw new NotFoundError("Room no longer exists");

        const bookings = await listRoomBookingsForDeletion(roomId, tx);
        if (bookings.length > 0) {
            await insertDeletedRoomNotifications(
                bookings.map((booking) => ({
                    userId: booking.userId,
                    message: `Room deleted: Your booking "${booking.title}" in ${existingRoom.name}, ${existingRoom.location} on ${formatBookingSlot(booking.startTime, booking.endTime)} was removed.`,
                })),
                tx,
            );
        }

        await deleteAdminRoom(roomId, tx);
        return existingRoom;
    });

    return { room: serializeRoom(room) };
}
