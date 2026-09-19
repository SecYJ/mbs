# Zod Conventions

Applies to Zod schemas and types inferred from them.

- For Zod schema fallbacks, do not chain `.default()` together with `.catch()`; `.catch()` already covers the fallback cases `.default()` would handle.
- Do not create or export an inferred type from a Zod schema (e.g. `z.infer<typeof Schema>`) unless it is actually used somewhere. If the type has no consumers, remove it.
