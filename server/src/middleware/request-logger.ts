import type { NextFunction, Request, Response } from "express";

export function requestLogger(request: Request, response: Response, next: NextFunction) {
    const startedAt = performance.now();
    const requestLabel = `${request.method} ${request.path}`;

    console.info(`[http] --> ${requestLabel}`);

    response.once("finish", () => {
        const durationMs = Math.round(performance.now() - startedAt);

        console.info(`[http] <-- ${requestLabel} ${response.statusCode} ${durationMs}ms`);
    });

    next();
}
