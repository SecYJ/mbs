import type { Response } from "express";

type AuthenticatedLocals = {
    userId: string;
    userRole: string;
};

export type AuthenticatedResponse = Response<unknown, AuthenticatedLocals>;
