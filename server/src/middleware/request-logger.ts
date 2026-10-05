import type { NextFunction, Request, Response } from "express";

const RESET_PASSWORD_TOKEN_PATH = /(\/reset-password\/)[^/]*/i;

// Logs the path only: never the query string (may hold tokens) and never the password-reset token segment.
export function getLoggablePath(url: string) {
    const path = url.split("?", 1)[0] ?? "";

    return path.replace(RESET_PASSWORD_TOKEN_PATH, "$1[redacted]");
}

export function requestLogger(request: Request, response: Response, next: NextFunction) {
    const startedAt = performance.now();
    const requestLabel = `${request.method} ${getLoggablePath(request.originalUrl)}`;

    console.info(`[http] --> ${requestLabel}`);

    response.once("finish", () => {
        const durationMs = Math.round(performance.now() - startedAt);

        console.info(`[http] <-- ${requestLabel} ${response.statusCode} ${durationMs}ms`);
    });

    next();
}
