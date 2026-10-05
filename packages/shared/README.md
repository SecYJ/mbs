# Shared definitions

`@mbs/shared` contains definitions used in more than one workspace:

- `@mbs/shared/db/schema` defines database tables, columns, and constraints. The Express repos and migration tools import the same schema.
- `@mbs/shared/roles` defines user roles and role checks. Both applications use it; importing roles does not import database code.

The package does not open database connections. Business rules and queries stay in the server features; UI code stays in the client. Keep feature-specific request validation with its feature.

## Database tools

Migration history, Drizzle configuration, and seed scripts live in `server/`. Commands read `DATABASE_URL` from the environment or `server/.env`:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
pnpm --filter @mbs/server seed:equipment
pnpm --filter @mbs/server seed:room-equipment
```

The server and shared package use the same Drizzle ORM version. Migration history uses the folder format required by the server's Drizzle Kit version; existing migration SQL is preserved.

For the Render SSL configuration, run `pnpm --filter @mbs/server exec drizzle-kit migrate --config=drizzle.render.config.ts` with the deployment's `DATABASE_URL`.

Run `pnpm --filter @mbs/shared typecheck` and both application checks when changing shared definitions. See the [verification guide](../../docs/verification.md).
