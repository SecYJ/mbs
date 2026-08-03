import { status } from "http-status";

export class UnauthorizedError extends Error {
    public readonly statusCode = status.UNAUTHORIZED;

    constructor(message = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}
