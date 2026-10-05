import { isAdminRole } from "@mbs/shared/roles";
import type { NextFunction, Request } from "express";

import { ForbiddenError } from "#app/errors/forbiddenError";
import type { AuthenticatedResponse } from "#app/types";

export function requireAdmin(_req: Request, res: AuthenticatedResponse, next: NextFunction) {
    if (!isAdminRole(res.locals.userRole)) {
        throw new ForbiddenError();
    }

    next();
}
