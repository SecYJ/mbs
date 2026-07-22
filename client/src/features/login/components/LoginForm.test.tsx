import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, beforeEach } from "vitest";

import { LoginForm } from "@/features/login/components/LoginForm";
import { renderWithFileRoutes } from "@/test/file-route-utils";

describe("Login Form", () => {
    beforeEach(() => {
        renderWithFileRoutes(<LoginForm />, { initialLocation: "/login" });
    });

    afterEach(() => cleanup());

    it("should render email and password fields", () => {
        const email = screen.getByRole("textbox", { name: /^email address$/i });
        const password = screen.getByLabelText(/passphrase/i, { selector: "input" });

        expect(email).toBeVisible();
        expect(password).toBeVisible();
    });

    it("should render the available login actions", () => {
        const forgotLink = screen.getByRole("link", { name: /^forgot\?$/i });
        const continueSubmitButton = screen.getByRole("button", { name: /^continue$/i });

        expect(forgotLink).toHaveAttribute("href", "/forgot-password");
        expect(continueSubmitButton).toBeEnabled();
    });

    it("allows user to enter an email and password", async () => {
        const email = screen.getByRole("textbox", { name: /^email address$/i });
        const password = screen.getByLabelText(/passphrase/i, { selector: "input" });

        const user = userEvent.setup();

        const emailValue = "hello@gmail.com";
        const passwordValue = "123456789";

        await user.type(email, emailValue);
        await user.type(password, passwordValue);

        expect(email).toHaveValue(emailValue);
        expect(password).toHaveValue(passwordValue);
    });

    it("shows validation errors when submitting empty fields", async () => {
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /continue/i }));

        expect(screen.getByText(/enter a valid email address/i)).toBeVisible();
        expect(screen.getByText(/^passphrase is required$/i)).toBeVisible();
    });
});
