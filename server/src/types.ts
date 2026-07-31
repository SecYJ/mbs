import type { Request, RequestHandler } from "express";

type AuthenticatedLocals = {
    userId: string;
};

export type AuthenticatedRequestHandler = RequestHandler<
    Request["params"],
    unknown,
    unknown,
    Request["query"],
    AuthenticatedLocals
>;
