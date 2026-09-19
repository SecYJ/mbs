import type { Request, RequestHandler, Response } from "express";

type AuthenticatedLocals = {
    userId: string;
    userRole: string;
};

export type AuthenticatedResponse = Response<unknown, AuthenticatedLocals>;

export type AuthenticatedRequestHandler = RequestHandler<
    Request["params"],
    unknown,
    unknown,
    Request["query"],
    AuthenticatedLocals
>;
