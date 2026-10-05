import { SERVICE_UNAVAILABLE_MESSAGE, ServerApiError } from "@/lib/server-api-error";

const MAX_QUERY_RETRIES = 1;

// Server function errors only keep their message when they cross to the browser, so the
// BFF gives network failures and 5xx responses one fixed message that is recognized here.
// A failed `fetch` to the BFF itself surfaces as a TypeError.
function isTransientError(error: unknown) {
    if (error instanceof ServerApiError) {
        return error.statusCode === null || error.statusCode >= 500;
    }

    if (error instanceof TypeError) return true;

    return error instanceof Error && error.message === SERVICE_UNAVAILABLE_MESSAGE;
}

// Never retry on the server: a slow retry would delay the server-rendered response.
export function shouldRetryQuery(failureCount: number, error: unknown) {
    if (typeof window === "undefined") return false;

    return failureCount < MAX_QUERY_RETRIES && isTransientError(error);
}
