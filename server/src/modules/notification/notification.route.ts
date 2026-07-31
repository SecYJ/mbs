import express from "express";

import {
    getNotificationsController,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "#app/modules/notification/notification.controller";

export const notificationRouter = express.Router();

notificationRouter.get("/", getNotificationsController);

notificationRouter.patch("/", markAllNotificationsAsRead);

notificationRouter.patch("/:notificationId", markNotificationAsRead);
