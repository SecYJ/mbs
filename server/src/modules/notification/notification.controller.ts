import type { Request } from "express";
import { status } from "http-status";

import { notificationFilterSchema, notificationIdSchema } from "#app/modules/notification/notification.schema";
import {
    getNotificationsService,
    markAllNotificationsAsReadService,
    markNotificationAsReadService,
} from "#app/modules/notification/notification.service";
import type { AuthenticatedResponse } from "#app/types";

export async function getNotificationsController(req: Request, res: AuthenticatedResponse) {
    const { userId } = res.locals;

    const { filter } = notificationFilterSchema.parse(req.query);
    res.json(await getNotificationsService(userId, filter));
}

export async function markAllNotificationsAsReadController(_req: Request, res: AuthenticatedResponse) {
    const { userId } = res.locals;

    await markAllNotificationsAsReadService(userId);

    res.status(status.NO_CONTENT).send();
}

export async function markNotificationAsReadController(req: Request, res: AuthenticatedResponse) {
    const { notificationId } = notificationIdSchema.parse(req.params);
    const { userId } = res.locals;

    await markNotificationAsReadService(userId, notificationId);

    res.status(status.NO_CONTENT).send();
}
