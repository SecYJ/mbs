import type { Request } from "express";

import { myBookingQuerySchema } from "#app/modules/mybooking/mybooking.schema";
import { getMyBookingStatsService, getMyBookingsDataService } from "#app/modules/mybooking/mybooking.service";
import type { AuthenticatedResponse } from "#app/types";

export async function myBookingsDataController(req: Request, res: AuthenticatedResponse) {
    const { group, q } = myBookingQuerySchema.parse(req.query);

    res.json(
        await getMyBookingsDataService({
            userId: res.locals.userId,
            group,
            query: q,
        }),
    );
}

export async function myBookingStatsController(_req: Request, res: AuthenticatedResponse) {
    res.json(await getMyBookingStatsService(res.locals.userId));
}
