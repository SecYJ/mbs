import express from "express";

import {
    getNotificationsController,
    markAllNotificationsAsReadController,
    markNotificationAsReadController,
} from "#app/modules/notification/notification.controller";

export const notificationRouter = express.Router();

notificationRouter.get("/", getNotificationsController);

notificationRouter.patch("/", markAllNotificationsAsReadController);

notificationRouter.patch("/:notificationId", markNotificationAsReadController);
