# Login Schema Testing Guide

This guide teaches how to test the login schema without involving React, forms, routing, or server functions.

## File Location

Create the production test next to the schema:

```txt
src/features/login/schema/login.schema.ts
src/features/login/schema/login.schema.test.ts
```

Keeping the test next to the schema makes it easy to find the rule and its proof together.

## What You Are Testing

The login schema currently owns these rules:

```txt
email must be a valid email address
password must not be empty
```

So the test file should prove those rules only.

## What Not To Test Here

Do not test these in the schema test:

- whether the login form renders
- whether a user can type into inputs
- whether the submit button works
- whether navigation happens after login
- whether the server function signs in correctly

Those belong to component, hook, or integration tests.

## Test Cases To Write

Start with three cases:

```txt
valid login data passes
invalid email fails
empty password fails
```

That is enough for the first version.

## Testing Pattern

Use `safeParse` when learning schema tests.

Why:

- it does not throw
- it returns `success: true` or `success: false`
- failed results include validation issues

The mental model:

```txt
arrange input data
parse with loginSchema.safeParse
expect success or failure
inspect the error message when needed
```

## Example Shape

Do not copy this blindly. Read it as the structure you are aiming for:

```ts
import { describe, expect, it } from "vitest";

import { loginSchema } from "./login.schema";

describe("loginSchema", () => {
    it("accepts valid login data", () => {
        const result = loginSchema.safeParse({
            email: "person@example.com",
            password: "secret",
        });

        expect(result.success).toBe(true);
    });
});
```

## How To Think About Failures

For invalid data, assert two things:

```txt
the parse failed
the reason matches the business rule
```

Example learning target:

```txt
email: "not-an-email"
password: "secret"
```

Expected result:

```txt
success is false
one issue says "Enter a valid email address"
```

## Suggested Exercise

Write `login.schema.test.ts` yourself with these tests:

1. valid data passes
2. invalid email shows `Enter a valid email address`
3. empty password shows `Passphrase is required`

After each test, run only that file:

```bash
vp test run src/features/login/schema/login.schema.test.ts
```

## Review Checklist

Before moving on, check:

- Did you import from `vitest`?
- Did you use `safeParse`?
- Did each test prove one rule?
- Did you avoid React Testing Library in this file?
- Did you avoid testing implementation details of Zod?

If all answers are yes, this is a good schema test.
