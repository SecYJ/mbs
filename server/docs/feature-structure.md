# Feature Structure

Organize features under `server/src/modules/<feature>/` using the route, controller, schema, service, and repo pattern.

| File                      | Responsibility                                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<feature>.route.ts`      | Register routes and middleware, and connect routes to controllers.                                                                                                             |
| `<feature>.controller.ts` | Parse request input with the feature schemas, read authenticated user context, call services, and send responses. Keep database queries and business logic out of controllers. |
| `<feature>.schema.ts`     | Define Zod schemas for request validation. Follow the shared Zod conventions.                                                                                                  |
| `<feature>.service.ts`    | Apply business rules and coordinate repo calls. Keep HTTP request and response objects out of services.                                                                        |
| `<feature>.repo.ts`       | Own Drizzle/SQL queries and database writes. Accept explicit inputs and return the data the service needs. Keep HTTP concerns out of repos.                                    |

Follow this five-part pattern for new features and when restructuring existing ones.

## Reference Code

Use the following Mybooking files as references for specific responsibilities:

- [Route](../src/modules/mybooking/mybooking.route.ts): route registration and controller wiring.
- [Controller](../src/modules/mybooking/mybooking.controller.ts): request validation, authenticated user context, and responses.
- [Schema](../src/modules/mybooking/mybooking.schema.ts): request validation schemas.
- [Service](../src/modules/mybooking/mybooking.service.ts): coordinate repo calls and serialize dates for the response.
- [Repo](../src/modules/mybooking/mybooking.repo.ts): database queries, including nested selections and SQL aggregation.

Keep feature-specific access rules in the feature's queries. Share a query function only when multiple features need the same database operation; shared fields alone do not justify a shared endpoint.
