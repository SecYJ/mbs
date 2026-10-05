# Server

This workspace owns authentication, application APIs, business rules, and runtime database operations.

TanStack Start server functions in `client/` form the BFF: they validate input, forward cookies to Express, and preserve the types expected by the UI. They do not query the database. Migrations and seed scripts live here and use `DATABASE_URL`; the BFF does not need database credentials.

The database schema has one source in [packages/shared](../packages/shared/README.md), imported through `@mbs/shared/db/schema`. Repos own queries; the shared package owns table definitions and opens no connections.

## Feature Structure

Application features live under `src/modules/`. Keep their database operations and business rules in this workspace; client server functions forward requests to these APIs.

Follow the [feature structure](./docs/feature-structure.md) and [database query conventions](./docs/database-queries.md) when changing existing features or migrating another feature into this workspace.

All application routes use the `/api/${API_VERSION}` prefix:

| Path              | Feature                                                                 | Access                                                |
| ----------------- | ----------------------------------------------------------------------- | ----------------------------------------------------- |
| `/booking`        | Calendar data, room browsing, booking details, create/edit/cancel, RSVP | Authenticated; writes check ownership or invitation   |
| `/mybooking`      | Personal booking history and counts                                     | Authenticated                                         |
| `/notifications`  | Notification list and read status                                       | Authenticated recipient                               |
| `/admin/rooms`    | Room management                                                         | Admin; deletion requires super admin                  |
| `/admin/bookings` | All bookings and statistics                                             | Admin; cancellation requires ownership or super admin |
| `/admin/users`    | User list and last-login information                                    | Admin                                                 |

Authentication and user creation keep using the existing Better Auth endpoints. Admin cancellation also notifies the organizer, preserving the admin workflow. The calendar-data response contains rooms and users; personal history comes from `/mybooking`.

## Development

From the repository root:

```bash
pnpm dev:server
```

The Better Auth handler is mounted under `/api/${API_VERSION}/auth/*`, using `API_VERSION` from the server environment.

`src/app.ts` assembles the application, including Better Auth before the JSON body parser. `src/server.ts` starts the listener. See the [verification guide](../docs/verification.md) for typechecks and database regression tests.
