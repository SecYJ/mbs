import express from "express";

import { getNotificationsController } from "#app/modules/notifications/notification.controller";

export const notificationsRouter = express.Router();

notificationsRouter.get("/", getNotificationsController);
