# Verification

Run commands from the repository root using pnpm. Choose checks for the code and behavior changed, and report what passed, failed, or could not run.

## Code Changes

| Change                                     | Checks                                                                                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client TypeScript or React code            | `pnpm --filter @mbs/client typecheck` and the relevant client tests.                                                                                                      |
| Server TypeScript code                     | `pnpm --filter @mbs/server typecheck` and a focused check of the affected behavior. The server currently has no test script; typechecking alone does not verify behavior. |
| JavaScript or TypeScript in either package | `pnpm exec oxlint <changed-files>` in addition to the applicable checks above.                                                                                            |
| Formatting                                 | `pnpm exec oxfmt --check <changed-files>` for files supported by the formatter.                                                                                           |

Replace `<changed-files>` with actual file paths. Keep checks scoped to the change; broaden them when shared behavior or configuration is affected.

Root `pnpm typecheck`, `pnpm test`, and `pnpm test:run` currently target only the client. For changes spanning both packages, run each package's checks explicitly.

## Client Tests

Read the [client testing guide](../client/test/README.md) when writing or changing tests. Tests live beside the code they cover; `client/test/` contains learning notes and checklists.

- Run relevant tests once with `pnpm --filter @mbs/client test:run <test-file>`; use a test path relative to `client/`.
- Use `pnpm --filter @mbs/client test:run` when the full client suite is warranted.
- The test setup has unit tests and browser tests. Browser tests use Playwright Chromium; report a missing browser or environment dependency if it prevents verification.
- Prefer the `test:run` script for verification so the process exits instead of remaining in watch mode.

## Documentation Changes

- Check that local Markdown links resolve relative to the file containing each link.
- Check referenced commands against package scripts and referenced source files against the current code.
- Run the formatter check on changed Markdown files and `git diff --check` for whitespace errors. The formatter configuration ignores `AGENTS.md`, so inspect those files manually as well. Include newly created documents in the link and formatting checks.
- Application tests are not needed for documentation-only changes.
