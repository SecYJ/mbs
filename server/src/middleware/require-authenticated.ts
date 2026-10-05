import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request } from "express";

import { UnauthorizedError } from "#app/errors/unauthorizedError";
import { auth } from "#app/lib/auth";
import type { AuthenticatedResponse } from "#app/types";

export async function requireAuthenticated(req: Request, res: AuthenticatedResponse, next: NextFunction) {
    const userSession = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });

    if (!userSession) {
        throw new UnauthorizedError();
    }

    res.locals.userId = userSession.user.id;
    res.locals.userRole = userSession.user.role ?? "user";

    next();
}
