import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (request, response, next) => {
    const startedAt = performance.now();
    const requestLabel = `${request.method} ${request.path}`;

    console.info(`[http] --> ${requestLabel}`);

    response.once("finish", () => {
        const durationMs = Math.round(performance.now() - startedAt);

        console.info(`[http] <-- ${requestLabel} ${response.statusCode} ${durationMs}ms`);
    });

    next();
};
