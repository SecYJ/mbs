### Latest library information

- Use Context7 when looking for up to date docs and information.

## Coding Style

- Use arrow functions instead of function declarations except the page under createFileRoute from tanstack/router.
- In Tailwind CSS classes, do not add the `var(...)` keyword for CSS variables; use the `(...)` shorthand instead.
- In Tailwind CSS v4 data attribute variants, use direct boolean variants like `data-popup-open:border-(--hairline)`. Use square brackets only when matching a specific data attribute value, such as `data-[dialog=active]:...`.
- Conditional `className` values must use the `cn` function instead of string template literals or inline conditional strings.

## TypeScript

- use type allias instead of interface
- prefer auto-inferred return types over explicit return type annotations.

## Zod

- For Zod schema fallbacks, do not chain `.default()` together with `.catch()`; `.catch()` already covers the fallback cases `.default()` would handle.
-   - **No unused schema types**: Do not create or export an inferred type from a Zod schema (e.g., `z.infer<typeof Schema>`) unless it is actually used somewhere. If the type has no consumers, remove it.

## React

- Using React v19
- Skip `useMemo`, `useCallback`, and `memo` — react-compiler handles memoization.
- For filter/sort/search/pagination state, use URL search params (e.g. TanStack Router `useSearch`) instead of `useState`.

## Feature Organization

- Keep route files thin: route config, search validation, loaders, and the imported feature page only.
- Feature folders should own their `components/`, `hooks/`, `schemas/`, `services/` and `utils/` when those concerns exist.
- Prefer `schemas/` over a singular `schema/` folder.
- Move workflow and data-model logic into feature hooks so JSX components do not become bloated.
- Name components by business responsibility, not UI shape. Prefer names like `BookingRoomFilters`, `RoomBookingSchedule`, or `BookingReservationEditor` over generic names like `Drawer`, `Dialog`, `Shell`, or `Panel`.
- Keep components focused on one responsibility. Do not mix business logic and presentational layout when a hook or child component can own that concern clearly.
- For nested workflows, pass close/success callbacks to the component that owns the business action. For example, if a form submission should close a drawer, pass `onClose` to the form/workflow component and let that component close after successful submit.

## Dev Server

- If you start a dev server manually (e.g. `vp dev`) for verification, stop it once the task is complete. Don't leave it running in the background.
