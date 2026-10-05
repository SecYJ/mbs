# MBS workspace

This repository is a pnpm workspace:

- `client/` contains the existing TanStack Start application.
- `server/` contains the Express backend.
- `packages/shared/` contains the database schema and role definitions shared by the applications and database tools.

TanStack Start server functions in `client/` act as a BFF that calls Express. Application database operations, business rules, migrations, and seed scripts live in `server/`. The shared package defines tables without opening a database connection.

## Development

Install all workspace dependencies from the repository root:

```bash
pnpm install
```

Run the existing application:

```bash
pnpm dev
```

Run the Express backend in a second terminal:

```bash
pnpm dev:server
```

Root application scripts such as `pnpm build`, `pnpm test:run`, and `pnpm typecheck` target `@mbs/client`. Database commands such as `pnpm db:migrate` target `@mbs/server` and use its `DATABASE_URL`. See the [shared package guide](./packages/shared/README.md) for database ownership and commands.

You can also target a workspace explicitly:

```bash
pnpm --filter @mbs/client dev
```

## Backend Learning

The [server guide](./server/README.md) describes the API boundaries. Follow the [feature conventions](./server/docs/feature-structure.md) and [verification guide](./docs/verification.md) when changing a feature.
