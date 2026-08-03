import { status } from "http-status";

export class ValidationError extends Error {
    public readonly statusCode = status.BAD_REQUEST;

    constructor(message = "Validation Failed") {
        super(message);
        this.name = "ValidationError";
    }
}
