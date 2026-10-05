import type { Request } from "express";

import { adminBookingsFilterSchema, cancelAdminBookingSchema } from "#app/modules/admin-booking/admin-booking.schema";
import {
    cancelAdminBookingService,
    getAdminBookingsService,
    getAdminBookingStatsService,
} from "#app/modules/admin-booking/admin-booking.service";
import type { AuthenticatedResponse } from "#app/types";

export async function adminBookingsController(req: Request, res: AuthenticatedResponse) {
    const input = adminBookingsFilterSchema.parse(req.query);

    res.json(await getAdminBookingsService(res.locals.userId, res.locals.userRole, input));
}

export async function adminBookingStatsController(_req: Request, res: AuthenticatedResponse) {
    res.json(await getAdminBookingStatsService());
}

export async function cancelAdminBookingController(req: Request, res: AuthenticatedResponse) {
    const input = cancelAdminBookingSchema.parse({ ...req.body, bookingId: req.params.bookingId });

    res.json(await cancelAdminBookingService(res.locals.userId, res.locals.userRole, input));
}
