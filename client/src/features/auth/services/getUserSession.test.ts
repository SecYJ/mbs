import { beforeEach, describe, expect, it, vi } from "vitest";

import { getUserSession } from "@/features/auth/services/getUserSession";
import { ServerApiError } from "@/lib/server-api-error";

const { json, getRequest } = vi.hoisted(() => ({ json: vi.fn(), getRequest: vi.fn() }));

vi.mock("@tanstack/react-start", () => ({
    createServerFn() {
        return {
            handler(handler: () => unknown) {
                return handler;
            },
        };
    },
}));
vi.mock("@tanstack/react-start/server", () => ({ getRequest }));
vi.mock("@/lib/server-api-client", () => ({
    getServerApiClient() {
        return { get: () => ({ json }) };
    },
}));

const session = {
    session: { id: "session-1", expiresAt: "2030-01-01T00:00:00.000Z" },
    user: {
        id: "user-1",
        name: "Jane",
        email: "jane@example.com",
        emailVerified: true,
        image: null,
        role: "user",
    },
};

beforeEach(() => {
    vi.resetAllMocks();
    getRequest.mockImplementation(() => new Request("http://localhost/"));
});

describe("getUserSession", () => {
    it("returns the parsed session when signed in", async () => {
        json.mockResolvedValue(session);

        const result = await getUserSession();

        expect(result?.user.id).toBe("user-1");
        expect(result?.session.expiresAt).toBeInstanceOf(Date);
    });

    it("returns null when the API reports no session", async () => {
        json.mockResolvedValue(null);

        expect(await getUserSession()).toBeNull();
    });

    it("returns null for a 401 response", async () => {
        json.mockRejectedValue(new ServerApiError("Unauthorized", 401, null));

        expect(await getUserSession()).toBeNull();
    });

    it.each([
        ["a 5xx response", new ServerApiError("The service is temporarily unavailable.", 503, null)],
        ["a network failure", new ServerApiError("The service is temporarily unavailable.", null, null)],
        ["an unexpected 4xx response", new ServerApiError("Forbidden", 403, null)],
    ])("rethrows %s instead of treating the user as signed out", async (_name, error) => {
        json.mockRejectedValue(error);

        await expect(getUserSession()).rejects.toBe(error);
    });

    it("rethrows a response that does not match the session schema", async () => {
        json.mockResolvedValue({ session: { id: "session-1" } });

        await expect(getUserSession()).rejects.toThrow();
    });

    it("looks the session up once per request", async () => {
        const request = new Request("http://localhost/");
        getRequest.mockReturnValue(request);
        json.mockResolvedValue(session);

        await Promise.all([getUserSession(), getUserSession()]);
        await getUserSession();

        expect(json).toHaveBeenCalledOnce();
    });

    it("looks the session up again for a different request", async () => {
        json.mockResolvedValue(session);

        await getUserSession();
        await getUserSession();

        expect(json).toHaveBeenCalledTimes(2);
    });

    it("does not cache a failed lookup", async () => {
        const request = new Request("http://localhost/");
        getRequest.mockReturnValue(request);
        json.mockRejectedValueOnce(new ServerApiError("The service is temporarily unavailable.", 503, null));
        json.mockResolvedValueOnce(session);

        await expect(getUserSession()).rejects.toThrow();
        expect(await getUserSession()).not.toBeNull();
    });
});
