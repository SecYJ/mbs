import type { NextFunction, Request, Response } from "express";
import { status } from "http-status";
import { ZodError } from "zod";

import { ForbiddenError } from "#app/errors/forbiddenError";
import { NotFoundError } from "#app/errors/notFoundError";
import { UnauthorizedError } from "#app/errors/unauthorizedError";
import { ValidationError } from "#app/errors/validationError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ZodError) {
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

    res.status(status.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
}
