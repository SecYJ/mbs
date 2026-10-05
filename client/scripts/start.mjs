// Production server for the TanStack Start build (`vite build` -> dist/).
// nginx terminates TLS and proxies to this process; Express is never public.
import process from "node:process";
import { fileURLToPath } from "node:url";

import { serve } from "srvx";
import { serveStatic } from "srvx/static";

import app from "../dist/server/server.js";

const port = Number(process.env.PORT || 3001);
const hostname = process.env.HOST || "127.0.0.1";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

const serveClientFiles = serveStatic({ dir: fileURLToPath(new URL("../dist/client", import.meta.url)) });

// Vite fingerprints everything under /assets/, so it can be cached forever.
async function clientFiles(request, next) {
    const response = await serveClientFiles(request, next);

    if (response.ok && new URL(request.url).pathname.startsWith("/assets/")) {
        response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    }

    return response;
}

const server = serve({
    fetch: app.fetch,
    middleware: [clientFiles],
    port,
    hostname,
    gracefulShutdown: true,
});

await server.ready();
