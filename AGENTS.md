<!-- intent-skills:start -->

## Skill Loading

Before substantial work:

- Skill check: run `bunx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `bunx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
  <!-- intent-skills:end -->

# AGENTS.md

## Coding Style

- Use arrow functions instead of function declarations except the page under createFileRoute from tanstack/router.

## TypeScript

- prefer auto-inferred return types over explicit return type annotations.

## React

- Using React v19
- Skip `useMemo`, `useCallback`, and `memo` — react-compiler handles memoization.
- For filter/sort/search/pagination state, use URL search params (e.g. TanStack Router `useSearch`) instead of `useState`.

## Dev Server

- If you start a dev server manually (e.g. `bun run dev`) for verification, stop it once the task is complete. Don't leave it running in the background.

## Research & Documentation

Resolution priority for library/framework docs:

1. **TanStack libraries** → use the TanStack intent skill first (`bunx @tanstack/intent@latest list` / `load`). If the issue persists after consulting the loaded `SKILL.md`, fall back to `context7` MCP.
2. **Other libraries** (React, Prisma, Tailwind, etc.) → use `context7` MCP directly.
3. **Still stuck** → use web search (`exa` MCP for general web; generic web search as last resort).

Prefer these over relying on training knowledge — even for well-known libraries — since versions and APIs drift. For general web lookups (news, blog posts, articles, non-library questions), use the `exa` MCP server instead of generic web search.
