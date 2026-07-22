# Server

This workspace contains the Express backend that is gradually becoming the single owner of authentication and application APIs.

The migration is intentionally incremental: some TanStack Start server code remains in `client/` until its corresponding Express flow has been implemented and verified.

## Learning The Migration

Use the [Backend Auth Migration Learning Guide](./docs/auth-migration-learning-guide.md) to learn the backend concepts and complete the remaining migration one vertical slice at a time.

## Development

From the repository root:

```bash
pnpm dev:server
```

The Better Auth handler is mounted under `/api/auth/*`.
