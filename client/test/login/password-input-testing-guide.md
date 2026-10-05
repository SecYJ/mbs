# PasswordInput Testing Guide

This guide uses Vitest Browser Mode with Playwright to test `PasswordInput` in a real Chromium browser.

Component and suggested test location:

```txt
src/components/PasswordInput.tsx
src/components/PasswordInput.browser.test.tsx
```

## Why This Is A Good Test

`PasswordInput` has focused user behavior:

- it renders a labeled password field
- it starts hidden
- clicking the button shows the passphrase
- clicking again hides it

## Browser Test Shape

Mount the component with `render` from `vitest-browser-react`, then use Vitest's browser locators and assertions:

```ts
import { expect } from "vitest";
import { page } from "vitest/browser";

const password = page.getByLabelText("Password");
await expect.element(password).toHaveAttribute("type", "password");
await page.getByRole("button", { name: "Show passphrase" }).click();
await expect.element(password).toHaveAttribute("type", "text");
```

`page.getByRole` and `page.getByLabelText` use the same user-facing accessibility information that a real browser user relies on. `expect.element` retries until the browser reaches the expected state. Use `await expect.element(locator).toBeVisible()` to check visibility.

## Important Setup Idea

`PasswordInput` expects a real `react-hook-form` control. The test therefore creates a small wrapper with `useForm` and passes `form.control` to the component.

`render` from `vitest-browser-react` mounts React and cleans up after each test. The existing [LoginForm browser test](../../src/features/login/components/LoginForm.browser.test.tsx) shows this setup with the app's query and router providers.
