import { app } from "#app/app";
import { pool } from "#app/db/index";
import { env } from "#app/env";

const SHUTDOWN_TIMEOUT_MS = 10_000;

const httpServer = app.listen(env.PORT, env.HOST, () => {
    console.info(`[server] listening on http://${env.HOST}:${env.PORT} (${env.NODE_ENV})`);
});

httpServer.on("error", (error) => {
    console.error("[server] failed to start:", error);
    process.exit(1);
});

let shuttingDown = false;

function shutdown(signal: NodeJS.Signals) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.info(`[server] ${signal} received, shutting down`);

    // Stop waiting for graceful shutdown if a connection never finishes.
    setTimeout(() => {
        console.error("[server] shutdown timed out, forcing exit");
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();

    httpServer.close(async (closeError) => {
        if (closeError) console.error("[server] error while closing the HTTP server:", closeError);

        try {
            await pool.end();
        } catch (error) {
            console.error("[server] error while closing the database pool:", error);
            process.exit(1);
        }

        process.exit(closeError ? 1 : 0);
    });

    // Keep-alive connections from the BFF would otherwise hold close() open until they time out.
    httpServer.closeIdleConnections();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
