import { Router } from "express";

import {
    createAdminRoomController,
    deleteAdminRoomController,
    getAdminRoomController,
    getAdminRoomsController,
    updateAdminRoomController,
} from "#app/modules/admin-room/admin-room.controller";

export const adminRoomRouter = Router();

adminRoomRouter.get("/", getAdminRoomsController);
adminRoomRouter.get("/:roomId", getAdminRoomController);
adminRoomRouter.post("/", createAdminRoomController);
adminRoomRouter.patch("/:roomId", updateAdminRoomController);
adminRoomRouter.delete("/:roomId", deleteAdminRoomController);
