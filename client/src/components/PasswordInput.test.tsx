import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it } from "vitest";

import { PasswordInput } from "@/components/PasswordInput";

describe("password input", () => {
    const PasswordInputComponent = () => {
        const form = useForm({
            defaultValues: {
                password: "",
            },
        });

        return (
            <PasswordInput
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter Your Passphrase"
            />
        );
    };

    afterEach(() => cleanup());

    it("renders a hidden password field by default", () => {
        render(<PasswordInputComponent />);

        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toHaveAttribute("type", "password");
    });

    it("should be able to toggle visibility of input field", async () => {
        render(<PasswordInputComponent />);

        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /show passphrase/i }));

        expect(screen.getByLabelText(/password/i)).toHaveAttribute("type", "text");
        expect(screen.getByRole("button", { name: /hide passphrase/i })).toBeInTheDocument();
    });
});
