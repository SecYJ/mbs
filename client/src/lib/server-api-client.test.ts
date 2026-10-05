import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getServerApiClient } from "@/lib/server-api-client";
import { SERVICE_UNAVAILABLE_MESSAGE, ServerApiError } from "@/lib/server-api-error";

const { requestHeaders, responseHeaders } = vi.hoisted(() => ({
    requestHeaders: new Map<string, string>(),
    responseHeaders: { current: new Headers() },
}));

vi.mock("@tanstack/react-start", () => ({
    createServerOnlyFn: (fn: unknown) => fn,
}));
vi.mock("@tanstack/react-start/server", () => ({
    getRequestHeader: (name: string) => requestHeaders.get(name),
    getResponseHeaders: () => responseHeaders.current,
}));
vi.mock("@/env", () => ({ env: { SERVER_ORIGIN: "http://127.0.0.1:3000", SERVER_API_VERSION: "v1" } }));

const fetchMock = vi.fn<(request: Request) => Promise<Response>>();

function jsonResponse(body: unknown, init: { status?: number; setCookies?: string[] } = {}) {
    const headers = new Headers({ "content-type": "application/json" });
    for (const setCookie of init.setCookies ?? []) headers.append("set-cookie", setCookie);

    return new Response(JSON.stringify(body), { status: init.status, headers });
}

beforeEach(() => {
    requestHeaders.clear();
    responseHeaders.current = new Headers();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("server API client request headers", () => {
    it("targets the versioned API under SERVER_ORIGIN", async () => {
        fetchMock.mockResolvedValue(jsonResponse({}));

        await getServerApiClient().get("notifications");

        expect(fetchMock.mock.calls[0]?.[0].url).toBe("http://127.0.0.1:3000/api/v1/notifications");
    });

    it("forwards cookie, origin, and x-forwarded-for unchanged", async () => {
        requestHeaders.set("cookie", "session=abc");
        requestHeaders.set("origin", "https://mbs.example.com");
        requestHeaders.set("x-forwarded-for", "203.0.113.7, 10.0.0.1");
        fetchMock.mockResolvedValue(jsonResponse({}));

        await getServerApiClient().get("notifications");

        const { headers } = fetchMock.mock.calls[0]![0];
        expect(headers.get("cookie")).toBe("session=abc");
        expect(headers.get("origin")).toBe("https://mbs.example.com");
        expect(headers.get("x-forwarded-for")).toBe("203.0.113.7, 10.0.0.1");
    });

    it("does not invent x-forwarded-for when the request has none", async () => {
        fetchMock.mockResolvedValue(jsonResponse({}));

        await getServerApiClient().get("notifications");

        expect(fetchMock.mock.calls[0]![0].headers.has("x-forwarded-for")).toBe(false);
    });

    it("can drop the cookie for unauthenticated calls while still forwarding the client address", async () => {
        requestHeaders.set("cookie", "session=abc");
        requestHeaders.set("x-forwarded-for", "203.0.113.7");
        fetchMock.mockResolvedValue(jsonResponse({}));

        await getServerApiClient().post("auth/request-password-reset", { context: { forwardCookie: false } });

        const { headers } = fetchMock.mock.calls[0]![0];
        expect(headers.has("cookie")).toBe(false);
        expect(headers.get("x-forwarded-for")).toBe("203.0.113.7");
    });
});

describe("server API client response cookies", () => {
    it("appends Set-Cookie headers from several calls in one request", async () => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse({}, { setCookies: ["a=1; Path=/", "b=2; Path=/"] }))
            .mockResolvedValueOnce(jsonResponse({}, { setCookies: ["c=3; Path=/"] }));
        const client = getServerApiClient();

        await client.get("auth/get-session");
        await client.get("notifications");

        expect(responseHeaders.current.getSetCookie()).toEqual(["a=1; Path=/", "b=2; Path=/", "c=3; Path=/"]);
    });

    it("leaves the response alone when the API sets no cookies", async () => {
        fetchMock.mockResolvedValue(jsonResponse({}));

        await getServerApiClient().get("notifications");

        expect(responseHeaders.current.getSetCookie()).toEqual([]);
    });
});

describe("server API client errors", () => {
    it("keeps the API message for 4xx responses", async () => {
        fetchMock.mockResolvedValue(jsonResponse({ message: "Room is unavailable." }, { status: 409 }));

        await expect(getServerApiClient().get("booking")).rejects.toMatchObject({
            name: "ServerApiError",
            message: "Room is unavailable.",
            statusCode: 409,
        });
    });

    it("replaces 5xx messages with the retryable service message", async () => {
        fetchMock.mockResolvedValue(jsonResponse({ message: "connect ECONNREFUSED 10.0.0.5:5432" }, { status: 500 }));

        await expect(getServerApiClient().get("booking")).rejects.toMatchObject({
            message: SERVICE_UNAVAILABLE_MESSAGE,
            statusCode: 500,
        });
    });

    it("reports network failures without a status code", async () => {
        fetchMock.mockRejectedValue(new TypeError("fetch failed"));

        const error = await getServerApiClient()
            .get("booking")
            .catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(ServerApiError);
        expect(error).toMatchObject({ message: SERVICE_UNAVAILABLE_MESSAGE, statusCode: null });
    });
});
