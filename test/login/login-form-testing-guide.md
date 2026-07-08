# LoginForm Component Testing Guide

This guide teaches how to begin testing `LoginForm` as a React component. It gives you a route through the problem without providing a finished test file.

Production files involved:

```txt
src/features/login/components/LoginForm.tsx
src/features/login/hooks/useLogin.ts
src/features/login/schema/login.schema.ts
```

Create your test next to the component:

```txt
src/features/login/components/LoginForm.test.tsx
```

## Learning Goal

By the end of this exercise, you should be able to:

- render a component with dependencies
- find form controls through accessible names
- interact with the form as a user
- wait for asynchronous validation
- replace an app boundary with a controlled test double
- distinguish component behavior from hook and router behavior

Do not try to solve every dependency and behavior in the first test. Build one small piece at a time.

## First Read The Component

Before creating the test file, read `LoginForm.tsx` and make two lists.

What can the user see?

```txt
an email field
a passphrase field
a forgot-password link
a continue button
field validation messages when input is invalid
a root error when login fails
```

What can the user do?

```txt
type an email address
type a passphrase
show or hide the passphrase
open the forgot-password page
submit the form
```

These observations become test cases. Internal variable names, hooks, and Tailwind classes do not.

## Decide The Test Boundary

`LoginForm` is not isolated. It calls `useLogin`, and it renders a TanStack Router `Link`.

The real `useLogin` reaches several other boundaries:

```txt
LoginForm
  -> useLogin
      -> react-hook-form and the login schema
      -> React Query mutation
      -> TanStack server function
      -> router invalidation and navigation
```

For your first component test, stop at the `useLogin` boundary. Give `LoginForm` a controlled replacement for that hook. This keeps the exercise focused on the form the user sees.

Later, write separate hook or integration tests for mutation, navigation, and server behavior.

## Understand The Hook Contract

Read the return statement in `useLogin.ts`.

Your test double must satisfy the same three-part contract:

```txt
form
onSubmit
isPending
```

Do not invent a fake `form` object property by property. `Controller`, `PasswordInput`, and `FormStateSubscribe` expect a real React Hook Form control. A small test-only hook implementation can call `useForm` and return its result.

Mental shape only:

```txt
controlled useLogin replacement
  creates a real form with email and password defaults
  connects form submission to a spy
  exposes a pending value chosen by the test
```

Your task is to translate that shape into your own test setup.

## Handle The Router Link Separately

Even after replacing `useLogin`, the `Forgot?` link still expects router context.

For this first component exercise, choose one approach:

1. Replace `Link` with a small anchor test double.
2. Render the component inside a memory router.

Start with the small test double. A memory router is more realistic, but it introduces route setup that does not help you learn the form yet.

Because the link is replaced in this test, prove that the user can find it by its accessible name. Save detailed navigation behavior for a router integration test.

## Build A Reusable Setup

Avoid repeating the same rendering and user setup in every test. Create a small `setup` helper in the test file.

It should eventually let a test choose state such as:

```txt
isPending: false
submit spy: a fresh vi.fn()
```

It should give the test access to:

```txt
the user returned by userEvent.setup()
the submission spy
```

Keep the helper small. If it starts reproducing the whole production hook, your test boundary is too wide.

## Query The Page Like A User

Prefer queries based on accessibility and visible meaning.

| User-visible control | Query to investigate                                  |
| -------------------- | ----------------------------------------------------- |
| Email Address        | `getByRole` with the textbox role and accessible name |
| Passphrase           | `getByLabelText`                                      |
| Forgot?              | `getByRole` with the link role                        |
| Continue             | `getByRole` with the button role                      |
| Validation message   | `findByText`                                          |
| Login failure        | `findByRole("alert")`                                 |

Why is the passphrase queried differently from the email field?

Inspect the rendered input type and check how password inputs appear in the accessibility tree. Use `screen.logTestingPlaygroundURL()` or `screen.debug()` if the answer is not obvious.

Avoid starting with:

```txt
querySelector
CSS classes
element IDs
component internals
```

## Exercise 1: Render The Form

Question:

```txt
Can the user find every control needed to begin signing in?
```

Arrange:

```txt
configure the hook replacement with isPending false
render LoginForm
```

Assert:

```txt
email field exists
passphrase field exists
forgot-password link exists
continue button exists and is enabled
```

Stop and run the test before moving on.

If rendering fails, read the error and identify which boundary still lacks context. Do not add providers at random.

## Exercise 2: Type Into Both Fields

Question:

```txt
Do the controls accept the credentials entered by the user?
```

Act:

```txt
create a user with userEvent.setup()
type a valid email into the email field
type a non-empty passphrase into the passphrase field
```

Assert the visible values of both inputs.

Remember that `user.type` is asynchronous. Await the interaction.

## Exercise 3: Submit Invalid Input

Question:

```txt
What feedback does the user receive after submitting empty or invalid fields?
```

To make this exercise meaningful, the controlled hook replacement must use the same `loginSchema` resolver as the production hook.

Start with one invalid case:

```txt
leave the form empty
click Continue
wait for the validation feedback
```

Then add the second field rule.

Use an asynchronous query when an element appears after form processing. Prefer finding the message the user sees instead of inspecting React Hook Form's error object.

Before finishing this exercise, answer:

- Was the submission spy called?
- Which input has `aria-invalid`?
- Does each test prove one validation story, or too many at once?

## Exercise 4: Submit Valid Credentials

Question:

```txt
Does valid user input cross the component's submission boundary?
```

Arrange a fresh submission spy, type valid values, and click Continue.

The important assertion is not that a network request occurred. This is a component test, so prove that the controlled submission boundary received the values entered by the user.

Submission happens through React Hook Form, so expect this assertion to require waiting.

Do not test navigation here. Navigation belongs to a test of the real `useLogin` success behavior or a wider integration test.

## Exercise 5: Pending State

Question:

```txt
Can the user submit again while a login attempt is pending?
```

Configure the hook replacement with `isPending` set to true, render the form, and inspect the Continue button.

Prove the observable behavior. Do not inspect the `isPending` variable itself.

For an extra check, try clicking the disabled button and decide whether an assertion about the submission spy adds useful confidence.

## Exercise 6: Root Login Error

This exercise is more advanced because the error is stored on the form, not passed as a visible prop.

Question:

```txt
Can the user understand why a completed login attempt failed?
```

Extend the controlled hook setup so a test can place a root error on the real form. Render the form and find the alert by role.

Keep the test focused on the visible alert. The production hook's conversion of a rejected mutation into that error belongs in a hook test.

## Suggested Test Order

Write and run one test at a time:

1. renders the controls needed to sign in
2. accepts an email and passphrase
3. shows email validation feedback
4. shows passphrase validation feedback
5. submits valid credentials to the controlled boundary
6. disables Continue while pending
7. displays a root login error

The passphrase visibility behavior is already owned by `PasswordInput`. It does not need to be repeated here unless you later write a wider user-flow test.

## Hint Ladder

Use only as much help as you need.

### Hint 1: Test Imports

Look at `PasswordInput.test.tsx`. Your form test will use the same Testing Library, `userEvent`, and Vitest imports, plus mocking utilities from Vitest.

### Hint 2: Mock The Module, Not The Component

Replace the module that exports `useLogin`. Continue rendering the real `LoginForm`.

If you replace `LoginForm` itself, there is no component behavior left to test.

### Hint 3: Return A Real Form

Your controlled `useLogin` implementation is still a hook, so it can call `useForm`. Give the form both default values expected by `LoginForm`.

### Hint 4: Connect Submission

React Hook Form's `handleSubmit` turns a valid-data callback into the form event handler expected by `LoginForm`.

Work out where your spy belongs in that relationship.

### Hint 5: Validation

The production hook connects `loginSchema` through `zodResolver`. Use those same pieces in the controlled hook if the component test needs real validation behavior.

### Hint 6: Changing Pending State

Let the setup helper accept an option. Each test should render with the state it needs instead of mutating shared state after rendering.

## Common Sticking Points

### `useNavigate` or router-context error

Your `useLogin` replacement is not active, or the `Link` still needs a controlled boundary.

### Invalid hook call

Make sure `useForm` runs inside a React component or a hook implementation invoked while React renders.

### Validation text is missing immediately after clicking

Form validation updates asynchronously. Use an awaited interaction and an asynchronous query for the new message.

### The submission spy has no calls

Check whether the values satisfy `loginSchema`. If validation fails, React Hook Form should not call the valid-data callback.

### Tests affect one another

Reset mock state between tests and create a fresh form during each render.

## What Not To Test Here

Do not test:

- Tailwind classes or animation timing
- `Controller` or `FormStateSubscribe` internals
- whether Zod itself works
- React Query's mutation implementation
- the server login function
- router invalidation or navigation
- the SVG path inside the arrow icon

Those are either library behavior, implementation details, or responsibilities of another test layer.

## Run The Exercise

Watch mode while learning:

```bash
vp test src/features/login/components/LoginForm.test.tsx
```

One-time run:

```bash
vp test run src/features/login/components/LoginForm.test.tsx
```

Run the test after every small addition. A short feedback loop makes it easier to understand which change caused a failure.

## Review Checklist

Before considering the component exercise complete:

- Can each test name finish the sentence "The user can..."?
- Are controls found by role, label, or visible text?
- Are `userEvent` interactions awaited?
- Are appearing validation messages queried asynchronously?
- Does each test create fresh form and mock state?
- Is the real `LoginForm` rendered?
- Are mutation, server, and navigation behavior left outside this component test?
- Does each test fail for one understandable reason?

If yes, you are ready to move on to testing `useLogin` as a separate integration boundary.
