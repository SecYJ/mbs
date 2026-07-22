import type { RequestHandler } from "express";

export const getNotificationsController: RequestHandler = (_req, res) => {
    res.json({ message: "bodoh" });
};
