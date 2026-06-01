<!-- intent-skills:start -->

## Skill Loading

Before substantial work:

- Skill check: run `vpx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `vpx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
    <!-- intent-skills:end -->

# AGENTS.md

## Coding Style

- Use arrow functions instead of function declarations except the page under createFileRoute from tanstack/router.
- In Tailwind CSS classes, do not add the `var(...)` keyword for CSS variables; use the `(...)` shorthand instead.
- In Tailwind CSS v4 data attribute variants, use direct boolean variants like `data-popup-open:border-(--hairline)`. Use square brackets only when matching a specific data attribute value, such as `data-[dialog=active]:...`.
- Conditional `className` values must use the `cn` function instead of string template literals or inline conditional strings.

## TypeScript
- use type instead of interface
- prefer auto-inferred return types over explicit return type annotations.

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

## Research & Documentation

Resolution priority for library/framework docs:

1. **TanStack libraries** → use the TanStack intent skill first (`vpx @tanstack/intent@latest list` / `load`). If the issue persists after consulting the loaded `SKILL.md`, fall back to `context7` MCP.
2. **Other libraries** (React, Prisma, Tailwind, etc.) → use `context7` MCP directly.
3. **Still stuck** → use web search (`exa` MCP for general web; generic web search as last resort).

Prefer these over relying on training knowledge — even for well-known libraries — since versions and APIs drift. For general web lookups (news, blog posts, articles, non-library questions), use the `exa` MCP server instead of generic web search.
