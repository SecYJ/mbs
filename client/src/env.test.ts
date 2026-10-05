import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
});

it("configures the BFF without a database connection string", async () => {
    vi.stubEnv("DATABASE_URL", undefined);
    vi.stubEnv("SERVER_ORIGIN", "http://localhost:3000");
    vi.stubEnv("SERVER_API_VERSION", "v1");

    const { env } = await import("./env");

    expect(env.SERVER_ORIGIN).toBe("http://localhost:3000");
    expect(env.SERVER_API_VERSION).toBe("v1");
    expect(env).not.toHaveProperty("DATABASE_URL");
});
