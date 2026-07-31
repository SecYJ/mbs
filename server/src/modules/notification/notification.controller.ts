import { status } from "http-status";

import { notificationFilterSchema, notificationIdSchema } from "#app/modules/notification/notification.schema";
import {
    getNotificationsService,
    markAllNotificationsAsReadService,
    markNotificationAsReadService,
} from "#app/modules/notification/notification.service";
import type { AuthenticatedRequestHandler } from "#app/types";

export const getNotificationsController: AuthenticatedRequestHandler = async (req, res) => {
    const { userId } = res.locals;

    const { filter } = notificationFilterSchema.parse(req.query);
    res.json(await getNotificationsService(userId, filter));
};

export const markAllNotificationsAsRead: AuthenticatedRequestHandler = async (_req, res) => {
    const { userId } = res.locals;

    await markAllNotificationsAsReadService(userId);

    res.status(status.NO_CONTENT).send();
};

export const markNotificationAsRead: AuthenticatedRequestHandler = async (req, res) => {
    const { notificationId } = notificationIdSchema.parse(req.params);
    const { userId } = res.locals;

    await markNotificationAsReadService(userId, notificationId);

    res.status(status.NO_CONTENT).send();
};
