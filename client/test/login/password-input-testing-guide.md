# PasswordInput Testing Guide

This guide uses Vitest Browser Mode with Playwright to test `PasswordInput` in a real Chromium browser.

Production test location:

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

The test mounts the component with React 19's `createRoot`, then uses Vitest's browser locators:

```ts
import { userEvent, page } from "vitest/browser";
import { expectBrowserAttribute } from "@/test/browser-assertions";

const password = page.getByLabelText("Password");
const user = userEvent.setup();

await expectBrowserAttribute(password, "type", "password");
await user.click(page.getByRole("button", { name: "Show passphrase" }));
await expectBrowserAttribute(password, "type", "text");
```

`page.getByRole` and `page.getByLabelText` use the same user-facing accessibility information that a real browser user relies on. The shared browser assertion helpers retry until the browser reaches the expected state.

## Important Setup Idea

`PasswordInput` expects a real `react-hook-form` control. The test therefore creates a small wrapper with `useForm` and passes `form.control` to the component.

The shared `renderInBrowser` helper mounts React into a browser container and unmounts it after each test. No DOM emulation or extra component-testing library setup is needed.
