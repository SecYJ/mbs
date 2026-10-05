import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { createRoomSchema, deleteRoomSchema, updateRoomSchema } from "@/features/admin/schema/room.schema";
import { roomsSearchSchema } from "@/features/admin/schema/rooms-search.schema";
import { getServerApiClient } from "@/lib/server-api-client";
import { adminUserMiddleware } from "@/middleware/auth";

type RoomResponse = {
    roomId: string;
    name: string;
    location: string;
    available: boolean;
    capacity: number;
    maxBookingDurationHours: number;
    createdAt: string | null;
    updatedAt: string | null;
};

type RoomDetailsResponse = RoomResponse & {
    equipment: { id: string; name: string; brand: string; model: string; quantity: number }[];
};

function restoreRoomDates<T extends RoomResponse>(room: T) {
    const { createdAt, updatedAt, ...fields } = room;
    return {
        ...fields,
        createdAt: createdAt === null ? null : new Date(createdAt),
        updatedAt: updatedAt === null ? null : new Date(updatedAt),
    };
}

export const getRoomsFn = createServerFn({ method: "GET" })
    .middleware([adminUserMiddleware])
    .validator(roomsSearchSchema)
    .handler(async ({ data }) => {
        const searchParams = {
            ...(data.q ? { q: data.q } : {}),
            ...(data.status ? { status: data.status } : {}),
            ...(data.sort ? { sort: data.sort } : {}),
        };
        const rooms = await getServerApiClient().get("admin/rooms", { searchParams }).json<RoomDetailsResponse[]>();
        return rooms.map(restoreRoomDates);
    });

export const getRoomFn = createServerFn({ method: "GET" })
    .middleware([adminUserMiddleware])
    .validator(z.object({ roomId: z.uuid() }))
    .handler(async ({ data }) => {
        const room = await getServerApiClient().get(`admin/rooms/${data.roomId}`).json<RoomDetailsResponse | null>();
        return room ? restoreRoomDates(room) : null;
    });

export const createRoomFn = createServerFn({ method: "POST" })
    .middleware([adminUserMiddleware])
    .validator(createRoomSchema)
    .handler(async ({ data }) => {
        const { room } = await getServerApiClient().post("admin/rooms", { json: data }).json<{ room: RoomResponse }>();
        return { room: restoreRoomDates(room) };
    });

export const updateRoomFn = createServerFn({ method: "POST" })
    .middleware([adminUserMiddleware])
    .validator(updateRoomSchema)
    .handler(async ({ data: { roomId, ...input } }) => {
        const { room } = await getServerApiClient()
            .patch(`admin/rooms/${roomId}`, { json: input })
            .json<{ room: RoomResponse }>();
        return { room: restoreRoomDates(room) };
    });

export const deleteRoomFn = createServerFn({ method: "POST" })
    .middleware([adminUserMiddleware])
    .validator(deleteRoomSchema)
    .handler(async ({ data }) => {
        const { room } = await getServerApiClient().delete(`admin/rooms/${data.roomId}`).json<{ room: RoomResponse }>();
        return { room: restoreRoomDates(room) };
    });
