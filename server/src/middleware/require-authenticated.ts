import { fromNodeHeaders } from "better-auth/node";

import { auth } from "#app/lib/auth";
import type { AuthenticatedRequestHandler } from "#app/types";

export const requireAuthenticated: AuthenticatedRequestHandler = async (req, res, next) => {
    const userSession = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });

    if (!userSession) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

    res.locals.userId = userSession.user.id;
    res.locals.userRole = userSession.user.role ?? "user";

    next();
};
