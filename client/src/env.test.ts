import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
});

describe("client env", () => {
    it("configures the BFF without a database connection string", async () => {
        vi.stubEnv("DATABASE_URL", undefined);
        vi.stubEnv("SERVER_ORIGIN", "http://localhost:3000");
        vi.stubEnv("SERVER_API_VERSION", "v1");

        const { env } = await import("./env");

        expect(env.SERVER_ORIGIN).toBe("http://localhost:3000");
        expect(env.SERVER_API_VERSION).toBe("v1");
        expect(env).not.toHaveProperty("DATABASE_URL");
    });

    it("fails when the module loads without SERVER_ORIGIN, so a bad deploy stops at startup", async () => {
        vi.stubEnv("SERVER_ORIGIN", undefined);
        vi.stubEnv("SERVER_API_VERSION", "v1");

        await expect(import("./env")).rejects.toThrow("Invalid environment variables");
    });

    it("treats an empty value as missing", async () => {
        vi.stubEnv("SERVER_ORIGIN", "http://localhost:3000");
        vi.stubEnv("SERVER_API_VERSION", "");

        await expect(import("./env")).rejects.toThrow("Invalid environment variables");
    });

    it("rejects a SERVER_ORIGIN that is not a URL", async () => {
        vi.stubEnv("SERVER_ORIGIN", "not a url");
        vi.stubEnv("SERVER_API_VERSION", "v1");

        await expect(import("./env")).rejects.toThrow("Invalid environment variables");
    });
});
