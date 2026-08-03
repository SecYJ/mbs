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
