# PasswordInput Testing Guide

This guide teaches how to get started with React Testing Library by testing `PasswordInput`.

Production test location:

```txt
src/components/PasswordInput.tsx
src/components/PasswordInput.test.tsx
```

## Why This Is A Good Next Test

`PasswordInput` is small, but it has real user behavior:

- it renders a labeled password field
- it starts hidden
- clicking the icon button shows the passphrase
- clicking again hides it
- it can show a validation message from `react-hook-form`
- it can render an accessory next to the label

This is a better first component test than `LoginForm` because it has fewer app-level dependencies.

## Testing Library Mindset

React Testing Library encourages tests that resemble how the app is used. For this component, that means:

```txt
render the input
find it by label
click the show/hide button
assert what changed in the DOM
```

Useful official docs:

- React Testing Library intro: https://testing-library.com/docs/react-testing-library/intro/
- Queries: https://testing-library.com/docs/queries/about/
- user-event: https://testing-library.com/docs/user-event/intro/

## Imports To Learn

You will usually need:

```ts
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
```

For this specific component, you also need `react-hook-form` because `PasswordInput` expects a `control` prop:

```ts
import { useForm } from "react-hook-form";
```

## Important Setup Idea

You cannot render `PasswordInput` alone unless you provide a real `control`.

The component expects props like:

```txt
label
placeholder
name
control
autoComplete
labelAccessory
```

So your test file should create a small test-only wrapper component.

Mental shape:

```txt
TestPasswordInput component
  calls useForm with defaultValues
  renders PasswordInput with control={form.control}
```

This wrapper is not production code. It exists only to give `PasswordInput` the same form context it expects in the app.

## First Test: Render The Field

Question:

```txt
Can the user find the passphrase field by its label?
```

Things to assert:

```txt
input exists
input has type password
show button exists
```

Queries to practice:

```ts
screen.getByLabelText("Passphrase");
screen.getByRole("button", { name: "Show passphrase" });
```

Matchers to practice:

```ts
toBeInTheDocument();
toHaveAttribute("type", "password");
```

## Second Test: Show The Passphrase

Question:

```txt
What happens when the user clicks the show button?
```

Steps:

```txt
create user with userEvent.setup()
render the wrapper
find the input by label
click the Show passphrase button
expect input type to become text
expect button name to become Hide passphrase
```

Why `userEvent`:

`userEvent` models real interactions more closely than directly firing a low-level event.

## Third Test: Hide The Passphrase Again

Question:

```txt
Can the user toggle back to hidden?
```

Steps:

```txt
click Show passphrase
click Hide passphrase
expect input type to become password again
expect button name to become Show passphrase again
```

This proves the toggle behavior, not the internal `useReducer` state.

## Fourth Test: Typing

Question:

```txt
Can the user type into the passphrase field?
```

Steps:

```txt
render the wrapper
type into the input
expect the input to have that value
```

Query:

```ts
screen.getByLabelText("Passphrase");
```

Matcher:

```ts
toHaveValue("secret");
```

This is a good place to use `toHaveValue` because now you are asserting against an actual input element.

## Fifth Test: Validation Message

This one is a little more advanced.

Question:

```txt
Does PasswordInput show the field error from react-hook-form?
```

You need the wrapper to create an error for the field. There are two common ways:

```txt
use a resolver/schema and submit invalid data
or call form.setError inside the wrapper
```

For learning, `form.setError` is simpler.

Things to assert:

```txt
error message appears
input has aria-invalid="true"
```

Queries and matchers:

```ts
screen.getByText("Passphrase is required");
toHaveAttribute("aria-invalid", "true");
```

## What Not To Test

Do not test:

- the `show` variable
- `useReducer`
- the icon SVG internals
- Tailwind classes
- `useId`
- whether `react-hook-form` itself works

Those are implementation details or library behavior.

Test what the user can observe:

```txt
hidden input
visible input
button accessible name
typed value
error message
invalid field state
```

## Suggested Test List

Write these one at a time:

1. renders the passphrase field hidden by default
2. shows the passphrase when the show button is clicked
3. hides the passphrase when the hide button is clicked
4. lets the user type a passphrase
5. shows a validation error when the field has one

Run only this file while learning:

```bash
vp test src/components/PasswordInput.test.tsx
```

For a one-time run:

```bash
vp test run src/components/PasswordInput.test.tsx
```

## Review Checklist

Before moving on:

- Did you use `screen` queries instead of `container.querySelector`?
- Did you find the input by label?
- Did you find the button by accessible name?
- Did you use `userEvent.setup()` for clicks and typing?
- Did each test prove one behavior?
- Did you avoid checking Tailwind classes?

If yes, you are learning the right testing muscle.
