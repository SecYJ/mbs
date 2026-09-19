# Agent Instructions

## Task Guidance

Before writing, modifying, or reviewing code or documentation, read and follow every document below that applies to the task. Paths are relative to the repository root. These documents contain required project conventions.

| When working on | Read |
| --- | --- |
| JavaScript or TypeScript | [Coding style](docs/coding-style.md) |
| Zod schemas or types inferred from them | [Zod conventions](docs/zod-conventions.md) |
| Implementing or changing feature behavior | [Product requirements](docs/requirements.md) |
| Verifying code or documentation changes | [Verification guide](docs/verification.md) |

When updating a convention, edit its document rather than duplicating the rule here. Keep this table up to date if documents move or new topics are added.

## Directory Instructions

Before working in a directory below, read and follow its instructions in addition to these shared rules, even when starting from the repository root.

- For `client/`, read [client/AGENTS.md](client/AGENTS.md).
- For `server/`, read [server/AGENTS.md](server/AGENTS.md).

## Latest Information

- When current information matters, use Context7 or web search—whichever fits best—and prefer official sources.
- Before consulting library documentation, check the relevant workspace package's installed version; use its package manifest and lockfile to confirm the intended version. Client and server dependencies can differ, so use documentation for the version relevant to the code being changed.

## Explanations

- Assume I am a total beginner in backend and databases. Explain those concepts using simple words while keep it short, avoid jargon, and include short, dead-simple examples.
- For SQL and database changes, use a hand-holding approach: explain one small query step at a time, show the equivalent plain SQL when useful, and explain what each table, condition, and result represents.
- When I ask to write a SQL or Drizzle query myself, do not complete the whole refactor for me. Review my current attempt, give me only the next small change, explain how to verify it, and wait for my result before continuing.

## Dev Server

- If you start a dev server manually (e.g. `pnpm dev`) for verification, stop it once the task is complete. Don't leave it running in the background.
