# React Testing Learning Roadmap

This folder is for learning notes, practice prompts, and testing checklists. Keep production tests close to the code they cover unless the project later adopts a different convention.

## Current Goal

Learn how to test this React app by understanding one layer at a time:

1. Vitest basics
2. Testing pure functions
3. Testing Zod schemas
4. Testing React components with Testing Library
5. Mocking app boundaries
6. Testing critical user flows

## Ground Rules

- Test behavior, not implementation details.
- Prefer user-facing queries: role, label, text, placeholder, display value.
- Avoid testing Tailwind classes unless the class is the actual behavior.
- Keep tests small enough that a failure tells you what broke.
- Mock boundaries, not everything.
- Start with easy tests before testing full app flows.

## Tools To Learn

### Vitest

Learn:

- `describe`, `it`, `expect`
- `beforeEach`
- `vi.fn`
- `vi.mock`
- async assertions with `await` and `waitFor`

Practice:

- Test one utility function.
- Test one function with edge cases.
- Test one async function with a mocked dependency.

### React Testing Library

Learn:

- `render`
- `screen`
- `getByRole`
- `getByLabelText`
- `findByText`
- `queryByText`

Practice:

- Render a form.
- Find inputs by their labels.
- Click a button.
- Assert an error message appears.

### User Event

Learn:

- `userEvent.setup()`
- `user.type`
- `user.click`
- `user.tab`
- `user.clear`

Practice:

- Type into email and password fields.
- Toggle password visibility.
- Submit a valid form.
- Submit an invalid form.

### Jest DOM Matchers

Learn:

- `toBeInTheDocument`
- `toBeVisible`
- `toBeDisabled`
- `toHaveAttribute`
- `toHaveValue`
- `toHaveTextContent`

Practice:

- Assert a button is disabled while pending.
- Assert an input has the expected value.
- Assert a link has the expected `href`.

## What To Test First In This App

### 1. Pure Logic

Good first targets:

- `src/lib/format.ts`
- `src/lib/cooldown.ts`
- booking date/time helpers
- notification formatting utilities

Why:

- No React setup needed.
- Tests are fast.
- Failures are easy to understand.

### 2. Schemas

Good first targets:

- login schema
- register schema
- reset password schema
- booking schema

Practice cases:

- valid data passes
- invalid email fails
- required fields fail
- password rules fail

### 3. Small Components

Good first targets:

- `PasswordInput`
- login form
- forgot password form
- reset password form

Practice cases:

- fields render with accessible labels
- typing updates inputs
- validation messages appear
- submit button disables during pending state

### 4. Feature Components

Later targets:

- booking filters
- reservation editor
- attendee picker
- admin search inputs

Practice cases:

- filters change visible results
- dialogs open and close
- selected values appear in the UI
- empty states appear when no data exists

## Login Form Learning Plan

Detailed exercise: [LoginForm Component Testing Guide](./login/login-form-testing-guide.md)

Do this in order:

1. Read the component and list what the user can see.
2. List what the user can do.
3. Decide what external dependencies should be mocked.
4. Write one render test.
5. Write one validation test.
6. Write one successful submit test.
7. Write one pending-state test.
8. Run the test after each small step.

Questions to ask before writing each test:

- What behavior am I proving?
- Would a user care about this?
- Can I query this by role, label, or visible text?
- Am I testing the component, or am I accidentally testing the library?

## Suggested First Exercises

1. Test that the login form renders an email field, passphrase field, forgot link, and continue button.
2. Test that empty submit shows validation messages.
3. Test that entering valid credentials calls the submit handler with the entered values.
4. Test that the passphrase visibility button changes the input type.
5. Test that a pending login disables the continue button.

## When To Mock

Mock these in component tests:

- navigation
- server functions
- API calls
- timers
- browser APIs missing from jsdom

Avoid mocking these when learning the basics:

- the component being tested
- Testing Library
- `userEvent`
- simple child components unless they make the test noisy

## When To Use MSW

Use MSW later when the behavior depends on HTTP requests.

For this app, start by mocking TanStack server-function boundaries or feature hooks. Add MSW only when you want tests that behave more like real network integration tests.

## Definition Of A Good First Test

A good first test is:

- easy to read
- focused on one behavior
- independent from other tests
- written with accessible queries
- not tied to CSS or internal state

If the test reads like a user story, you are probably on the right track.
