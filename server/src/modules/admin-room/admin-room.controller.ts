import type { Request } from "express";
import { status } from "http-status";

import {
    adminRoomInputSchema,
    adminRoomParamsSchema,
    adminRoomQuerySchema,
} from "#app/modules/admin-room/admin-room.schema";
import {
    createAdminRoomService,
    deleteAdminRoomService,
    getAdminRoomService,
    getAdminRoomsService,
    updateAdminRoomService,
} from "#app/modules/admin-room/admin-room.service";
import type { AuthenticatedResponse } from "#app/types";

export async function getAdminRoomsController(req: Request, res: AuthenticatedResponse) {
    const query = adminRoomQuerySchema.parse(req.query);
    res.json(await getAdminRoomsService(query));
}

export async function getAdminRoomController(req: Request, res: AuthenticatedResponse) {
    const { roomId } = adminRoomParamsSchema.parse(req.params);
    res.json(await getAdminRoomService(roomId));
}

export async function createAdminRoomController(req: Request, res: AuthenticatedResponse) {
    const input = adminRoomInputSchema.parse(req.body);
    res.status(status.CREATED).json(await createAdminRoomService(input));
}

export async function updateAdminRoomController(req: Request, res: AuthenticatedResponse) {
    const { roomId } = adminRoomParamsSchema.parse(req.params);
    const input = adminRoomInputSchema.parse(req.body);
    res.json(await updateAdminRoomService(roomId, input));
}

export async function deleteAdminRoomController(req: Request, res: AuthenticatedResponse) {
    const { roomId } = adminRoomParamsSchema.parse(req.params);
    res.json(await deleteAdminRoomService(roomId, res.locals.userRole));
}
