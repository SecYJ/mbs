# MBS workspace

This repository is a pnpm workspace with two application boundaries:

- `client/` contains the existing TanStack Start application.
- `server/` contains the Express backend.

Some database and server-side TanStack Start code remains in `client/` while it is migrated to Express one verified vertical slice at a time.

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

Root scripts forward to `@mbs/client`, so existing commands such as `pnpm build`, `pnpm test:run`, `pnpm typecheck`, and `pnpm db:migrate` continue to work.

You can also target a workspace explicitly:

```bash
pnpm --filter @mbs/client dev
```

## Backend Learning

The [Backend Auth Migration Learning Guide](./server/docs/auth-migration-learning-guide.md) explains the architecture, backend concepts, exercises, and verification checkpoints for the ongoing authentication migration.
