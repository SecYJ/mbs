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
| `/admin/bookings` | All bookings and statistics                                             | Admin; cancellation allowed for admin and super admin |
| `/admin/users`    | User list and last-login information                                    | Admin                                                 |
| `/health`         | Liveness and database check (outside the API prefix)                    | Public; used by deployment checks                     |

Authentication and user creation keep using the existing Better Auth endpoints. Admin cancellation also notifies the organizer, preserving the admin workflow. The calendar-data response contains rooms and users; personal history comes from `/mybooking`. The notification list returns the 100 most recent notifications; unread and total counts cover all of them.

Overlapping bookings are checked twice: the booking service locks the room row and checks for overlaps, and the `bookings_no_room_overlap` exclusion constraint (needs the `btree_gist` extension) makes Postgres reject any overlapping active booking that slips past the service. A constraint violation returns the same conflict message. Server-built dates and times use `APP_TIME_ZONE` from `@mbs/shared/time`.

## Roles

| Role          | Can do                                                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user`        | Normal user: own bookings, room browsing, notifications.                                                                                                                           |
| `admin`       | Manage rooms (not delete), cancel any booking, list all users, and manage only `user` accounts (create with role `user`, reset password, ban/unban). Cannot grant or revoke admin. |
| `super_admin` | Everything an admin can do, plus delete rooms and manage `admin` accounts (create admins, grant/revoke admin, reset password, ban/unban).                                          |

Rules that apply to everyone:

- Nobody can grant `super_admin`, and nobody can modify a `super_admin` account through the app. Assign it directly in the database.
- Nobody can change their own role or ban or remove themselves.
- Role helpers shared with the client live in [`packages/shared/src/roles.ts`](../packages/shared/src/roles.ts) (`canManageAccount`, `assignableRoles`).

Account actions go to Better Auth's admin endpoints (`/api/${API_VERSION}/auth/admin/*`), so the rules are enforced there in [`src/middleware/admin-auth.ts`](./src/middleware/admin-auth.ts):

- The access-control roles only grant `create`, `list`, `get`, `set-role`, `ban`, and `set-password` on users and `list` and `revoke` on sessions. Impersonation, removing users, and `update-user` are not granted to anyone, and those endpoints are disabled in `src/lib/auth.ts`.
- A `hooks.before` guard looks up the target account's current role and the requested role for every `/admin/*` request, and returns 403 when the actor may not manage that account or assign that role.

## Configuration

Environment variables (from the process environment; `pnpm dev` also reads `.env`):

| Variable             | Notes                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------- |
| `NODE_ENV`           | `development` (default), `production`, or `test`. Production enables secure cookies.   |
| `HOST`, `PORT`       | Listen address; default `127.0.0.1:3000`. Express is internal and must not be public.  |
| `SERVER_ORIGIN`      | Internal origin of this server, used as the Better Auth base URL.                      |
| `CLIENT_ORIGIN`      | Public origin of the web app. Trusted origin, and the base of password reset links.    |
| `DATABASE_URL`       | PostgreSQL connection string.                                                          |
| `BETTER_AUTH_SECRET` | At least 32 characters.                                                                |
| `API_VERSION`        | Path segment after `/api`.                                                             |
| `RESEND_API_KEY`     | Required when `NODE_ENV=production`. In development the reset link is printed instead. |
| `RESEND_FROM_EMAIL`  | Optional sender address.                                                               |

Password reset emails link to `${CLIENT_ORIGIN}/reset-password?token=<token>`. Reset links and tokens are never logged in production, and the request log records only the path.

Behind nginx, the client's server functions forward `X-Forwarded-For` unchanged. Better Auth rate-limits by that address, trusting only loopback proxies. Code uses `APP_TIME_ZONE` from `@mbs/shared/time` rather than the process time zone.

## Running

`GET /health` (no authentication, outside the API prefix) runs `select 1` and returns `200 {"status":"ok"}` or `503 {"status":"unavailable"}`.

```bash
pnpm --filter @mbs/server start
```

`start` runs `node src/server.ts` with variables from the environment (for example a systemd `EnvironmentFile`). On `SIGTERM` or `SIGINT` the server stops accepting connections, closes the database pool, and exits; it is forced to exit after 10 seconds. Idle database connection errors are logged instead of crashing the process.

## Development

From the repository root:

```bash
pnpm dev:server
```

The Better Auth handler is mounted under `/api/${API_VERSION}/auth/*`, using `API_VERSION` from the server environment.

`src/app.ts` assembles the application, including Better Auth before the JSON body parser. `src/server.ts` starts the listener. See the [verification guide](../docs/verification.md) for typechecks and database regression tests.
