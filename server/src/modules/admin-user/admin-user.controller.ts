import type { Request } from "express";

import { adminUsersQuerySchema } from "#app/modules/admin-user/admin-user.schema";
import { getAdminUsersService } from "#app/modules/admin-user/admin-user.service";
import type { AuthenticatedResponse } from "#app/types";

export async function adminUsersController(req: Request, res: AuthenticatedResponse) {
    const input = adminUsersQuerySchema.parse(req.query);

    res.json(await getAdminUsersService(input));
}
