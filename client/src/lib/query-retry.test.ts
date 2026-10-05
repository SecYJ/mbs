import { afterEach, describe, expect, it, vi } from "vitest";

import { shouldRetryQuery } from "@/lib/query-retry";
import { SERVICE_UNAVAILABLE_MESSAGE, ServerApiError } from "@/lib/server-api-error";

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("shouldRetryQuery in the browser", () => {
    it.each([
        ["a network failure", new ServerApiError(SERVICE_UNAVAILABLE_MESSAGE, null, null)],
        ["a 5xx response", new ServerApiError(SERVICE_UNAVAILABLE_MESSAGE, 502, null)],
        ["a serialized service error", new Error(SERVICE_UNAVAILABLE_MESSAGE)],
        ["a failed fetch to the BFF", new TypeError("Failed to fetch")],
    ])("retries %s once", (_name, error) => {
        vi.stubGlobal("window", {});

        expect(shouldRetryQuery(0, error)).toBe(true);
        expect(shouldRetryQuery(1, error)).toBe(false);
    });

    it.each([
        ["a 4xx response", new ServerApiError("Booking not found.", 404, null)],
        ["a serialized validation message", new Error("Room is unavailable.")],
    ])("does not retry %s", (_name, error) => {
        vi.stubGlobal("window", {});

        expect(shouldRetryQuery(0, error)).toBe(false);
    });
});

describe("shouldRetryQuery on the server", () => {
    it("never retries so server rendering is not delayed", () => {
        expect(shouldRetryQuery(0, new ServerApiError(SERVICE_UNAVAILABLE_MESSAGE, 503, null))).toBe(false);
    });
});
