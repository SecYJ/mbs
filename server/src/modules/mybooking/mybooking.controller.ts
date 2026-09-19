import { myBookingQuerySchema } from "#app/modules/mybooking/mybooking.schema";
import { getMyBookingStatsService, getMyBookingsDataService } from "#app/modules/mybooking/mybooking.service";
import type { AuthenticatedRequestHandler } from "#app/types";

export const myBookingsDataController: AuthenticatedRequestHandler = async (req, res) => {
    const { group, q } = myBookingQuerySchema.parse(req.query);

    res.json(
        await getMyBookingsDataService({
            userId: res.locals.userId,
            group,
            query: q,
        }),
    );
};

export const myBookingStatsController: AuthenticatedRequestHandler = async (_req, res) => {
    res.json(await getMyBookingStatsService(res.locals.userId));
};
