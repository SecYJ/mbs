import { STATUS_CODES } from "node:http";

import type { NextFunction, Request, Response } from "express";
import { status } from "http-status";
import { ZodError } from "zod";

import { ForbiddenError } from "#app/errors/forbiddenError";
import { NotFoundError } from "#app/errors/notFoundError";
import { UnauthorizedError } from "#app/errors/unauthorizedError";
import { ValidationError } from "#app/errors/validationError";
import { getLoggablePath } from "#app/middleware/request-logger";

const POSTGRES_UNIQUE_VIOLATION = "23505";

// body-parser and other middleware throw http-errors with a 4xx `status` and `statusCode`.
function getClientErrorStatus(err: unknown) {
    if (typeof err !== "object" || err === null) return undefined;

    const code = "status" in err ? err.status : "statusCode" in err ? err.statusCode : undefined;

    return typeof code === "number" && code >= 400 && code < 500 ? code : undefined;
}

// Drizzle wraps the driver error, so look through `cause` for the Postgres error code.
function hasPostgresErrorCode(err: unknown, code: string) {
    for (let current = err, depth = 0; current instanceof Error && depth < 5; depth++) {
        if ("code" in current && current.code === code) return true;
        current = current.cause;
    }

    return false;
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ZodError || (err instanceof SyntaxError && "status" in err && err.status === 400)) {
        const error = new ValidationError();
        res.status(error.statusCode).json({ message: error.message });
        return;
    }

    if (
        err instanceof ForbiddenError ||
        err instanceof NotFoundError ||
        err instanceof UnauthorizedError ||
        err instanceof ValidationError
    ) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    const clientErrorStatus = getClientErrorStatus(err);

    if (clientErrorStatus) {
        // Only the standard status text is returned; the original message can echo request details.
        res.status(clientErrorStatus).json({ message: STATUS_CODES[clientErrorStatus] ?? "Bad Request" });
        return;
    }

    // Log method and path only, never the query string, headers, or body.
    console.error(`[http] unexpected error on ${req.method} ${getLoggablePath(req.originalUrl)}:`, err);

    if (hasPostgresErrorCode(err, POSTGRES_UNIQUE_VIOLATION)) {
        res.status(status.CONFLICT).json({ message: "Conflict" });
        return;
    }

    res.status(status.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
}
