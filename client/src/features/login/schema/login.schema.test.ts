import { describe, expect, it } from "vitest";
import z from "zod";

import { loginSchema } from "@/features/login/schema/login.schema";

describe("login schema", () => {
    it("accepts valid login data", () => {
        const result = loginSchema.safeParse({
            email: "testing@gmail.com",
            password: "hello",
        });

        expect(result.success).toBe(true);
    });

    it("shows an error when email is invalid", () => {
        const result = loginSchema.safeParse({
            email: "bodoh",
            password: "bodoh",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(z.flattenError(result.error).fieldErrors.email?.[0]).toMatch(/^enter a valid email address$/i);
        }
    });

    it("shows an error when password is invalid", () => {
        const result = loginSchema.safeParse({
            email: "testing@gmail.com",
            password: "",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(z.flattenError(result.error).fieldErrors.password?.[0]).toMatch(/^passphrase is required$/i);
        }
    });
});
