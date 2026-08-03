import { status } from "http-status";

export class ForbiddenError extends Error {
    public readonly statusCode = status.FORBIDDEN;

    constructor(message = "Forbidden") {
        super(message);
        this.name = "ForbiddenError";
    }
}
