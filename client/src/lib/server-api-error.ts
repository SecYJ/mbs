export const SERVICE_UNAVAILABLE_MESSAGE = "The service is temporarily unavailable.";

export class ServerApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number | null,
        public readonly response: unknown,
    ) {
        super(message);
        this.name = "ServerApiError";
    }
}

function isApiErrorBody(body: unknown) {
    return typeof body === "object" && body !== null && "message" in body;
}

/** Resolves to `null` when the API answers 404, so pages can render their "not found" state. */
export async function nullIfNotFound<T>(request: Promise<T>): Promise<T | null> {
    try {
        return await request;
    } catch (error) {
        // Only the API's own `{ message }` 404 means "not found"; Express's default 404 page
        // (for example an API version mismatch) is a configuration error and should surface.
        if (error instanceof ServerApiError && error.statusCode === 404 && isApiErrorBody(error.response)) {
            return null;
        }

        throw error;
    }
}
