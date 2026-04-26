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

- Use arrow functions instead of function declarations.

## TypeScript

- prefer auto-inferred return types over explicit return type annotations.

## Research & Documentation

- For up-to-date library/framework/SDK/API/CLI docs (e.g. React, TanStack, Prisma, Tailwind), use the `context7` MCP server. Prefer it over web search and over relying on training knowledge — even for well-known libraries — since versions and APIs drift.
- For general web search (news, blog posts, articles, non-library lookups), use the `exa` MCP server instead of generic web search tools.
- Rule of thumb: library/API specifics → `context7`; everything else on the open web → `exa`.
