import { status } from "http-status";

export class NotFoundError extends Error {
    public readonly statusCode = status.NOT_FOUND;

    constructor(message = "Not Found") {
        super(message);
        this.name = "NotFoundError";
    }
}
