import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "#app/env";

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    keepAlive: true,
});

// An idle connection can break (for example when Postgres restarts). Without this listener the
// error would be unhandled and crash the process; the pool drops the bad connection and reconnects.
pool.on("error", (error) => {
    console.error("[db] idle client error:", error);
});

export const db = drizzle({
    client: pool,
});

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type Database = typeof db | Transaction;
