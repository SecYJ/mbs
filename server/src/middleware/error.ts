import type { ErrorRequestHandler } from "express";
import { status } from "http-status";

import { ForbiddenError } from "#app/errors/forbiddenError";
import { NotFoundError } from "#app/errors/notFoundError";
import { UnauthorizedError } from "#app/errors/unauthorizedError";
import { ValidationError } from "#app/errors/validationError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (
        err instanceof ForbiddenError ||
        err instanceof NotFoundError ||
        err instanceof UnauthorizedError ||
        err instanceof ValidationError
    ) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    res.status(status.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
};
