import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Render database commands");
}

const parsedDatabaseUrl = new URL(databaseUrl);

export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        host: parsedDatabaseUrl.hostname,
        port: Number(parsedDatabaseUrl.port || 5432),
        user: decodeURIComponent(parsedDatabaseUrl.username),
        password: decodeURIComponent(parsedDatabaseUrl.password),
        database: decodeURIComponent(parsedDatabaseUrl.pathname.slice(1)),
        ssl: "require",
    },
});
