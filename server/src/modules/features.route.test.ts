import { once } from "node:events";
import { createServer } from "node:http";

import express from "express";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ForbiddenError } from "#app/errors/forbiddenError";
import { NotFoundError } from "#app/errors/notFoundError";
import { UnauthorizedError } from "#app/errors/unauthorizedError";
import { ValidationError } from "#app/errors/validationError";
import { errorHandler } from "#app/middleware/error";
import { requireAuthenticated } from "#app/middleware/require-authenticated";
import { myBookingRouter } from "#app/modules/mybooking/mybooking.route";
import { getMyBookingStatsService, getMyBookingsDataService } from "#app/modules/mybooking/mybooking.service";
import { notificationRouter } from "#app/modules/notification/notification.route";
import {
    getNotificationsService,
    markAllNotificationsAsReadService,
    markNotificationAsReadService,
} from "#app/modules/notification/notification.service";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("#app/lib/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("#app/modules/mybooking/mybooking.service", () => ({
    getMyBookingsDataService: vi.fn(),
    getMyBookingStatsService: vi.fn(),
}));
vi.mock("#app/modules/notification/notification.service", () => ({
    getNotificationsService: vi.fn(),
    markAllNotificationsAsReadService: vi.fn(),
    markNotificationAsReadService: vi.fn(),
}));

const userId = "session-user";
const notificationId = "01990175-b8b8-7000-8000-000000000001";
const serviceMocks = [
    getMyBookingsDataService,
    getMyBookingStatsService,
    getNotificationsService,
    markAllNotificationsAsReadService,
    markNotificationAsReadService,
];

const app = express();
app.use("/api/v1/mybooking", requireAuthenticated, myBookingRouter);
app.use("/api/v1/notifications", requireAuthenticated, notificationRouter);
app.use(errorHandler);

const server = createServer(app);
let origin: string;

beforeAll(async () => {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") {
        throw new Error("Expected an HTTP test server address");
    }
    origin = `http://127.0.0.1:${address.port}/api/v1`;
});

afterAll(async () => {
    if (server.listening) {
        const closed = once(server, "close");
        server.close();
        await closed;
    }
});

beforeEach(() => {
    vi.resetAllMocks();
    getSession.mockResolvedValue({ user: { id: userId, role: "user" } });
    vi.mocked(getMyBookingsDataService).mockResolvedValue({ currentUserId: userId, history: [] });
    vi.mocked(getMyBookingStatsService).mockResolvedValue({ activeCount: 2, attendingCount: 1, ownedCount: 3 });
    vi.mocked(getNotificationsService).mockResolvedValue({ items: [], totalCount: 0, unreadCount: 0 });
    vi.mocked(markAllNotificationsAsReadService).mockResolvedValue(undefined);
    vi.mocked(markNotificationAsReadService).mockResolvedValue(undefined);
});

describe("feature authentication", () => {
    it.each([
        ["GET", "/mybooking"],
        ["GET", "/mybooking/stats"],
        ["GET", "/notifications"],
        ["PATCH", "/notifications"],
        ["PATCH", `/notifications/${notificationId}`],
    ])("rejects %s %s before calling a service when the session is missing", async (method, path) => {
        getSession.mockResolvedValue(null);

        const response = await fetch(`${origin}${path}`, { method });

        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ message: "Unauthorized" });
        for (const service of serviceMocks) {
            expect(service).not.toHaveBeenCalled();
        }
    });
});

describe("Mybooking routes", () => {
    it("returns the existing empty history shape for the session user", async () => {
        const response = await fetch(`${origin}/mybooking?userId=other-user`);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ currentUserId: userId, history: [] });
        expect(getMyBookingsDataService).toHaveBeenCalledExactlyOnceWith({
            userId,
            group: undefined,
            query: undefined,
        });
    });

    it.each(["upcoming", "in-progress", "past"])("parses the %s group and search query", async (group) => {
        const query = new URLSearchParams({ group, q: "Planning & review", userId: "other-user" });

        const response = await fetch(`${origin}/mybooking?${query}`);

        expect(response.status).toBe(200);
        expect(getMyBookingsDataService).toHaveBeenCalledExactlyOnceWith({
            userId,
            group,
            query: "Planning & review",
        });
    });

    it.each(["group=invalid", "group=upcoming&group=past", "q=one&q=two"])(
        "rejects malformed query %s before calling the service",
        async (query) => {
            const response = await fetch(`${origin}/mybooking?${query}`);

            expect(response.status).toBe(400);
            expect(await response.json()).toEqual({ message: "Validation Failed" });
            expect(getMyBookingsDataService).not.toHaveBeenCalled();
        },
    );

    it("returns the existing stats shape for the session user", async () => {
        const response = await fetch(`${origin}/mybooking/stats?userId=other-user`);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ activeCount: 2, attendingCount: 1, ownedCount: 3 });
        expect(getMyBookingStatsService).toHaveBeenCalledExactlyOnceWith(userId);
    });
});

describe("notification routes", () => {
    it.each([
        ["", undefined],
        ["filter=unread", "unread"],
        ["filter=all", undefined],
        ["filter=unknown", undefined],
        ["filter=unread&filter=unknown", undefined],
    ])("parses %s with the existing fallback to all notifications", async (query, filter) => {
        const response = await fetch(`${origin}/notifications?userId=other-user&${query}`);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ items: [], totalCount: 0, unreadCount: 0 });
        expect(getNotificationsService).toHaveBeenCalledExactlyOnceWith(userId, filter);
    });

    it("marks all notifications read for the session user and sends an empty 204", async () => {
        const response = await fetch(`${origin}/notifications?userId=other-user`, { method: "PATCH" });

        expect(response.status).toBe(204);
        expect(await response.text()).toBe("");
        expect(markAllNotificationsAsReadService).toHaveBeenCalledExactlyOnceWith(userId);
    });

    it("accepts a UUID and sends an empty 204 even when no notification was updated", async () => {
        const response = await fetch(`${origin}/notifications/${notificationId}?userId=other-user`, {
            method: "PATCH",
        });

        expect(response.status).toBe(204);
        expect(await response.text()).toBe("");
        expect(markNotificationAsReadService).toHaveBeenCalledExactlyOnceWith(userId, notificationId);
    });

    it("rejects an invalid notification UUID before calling the service", async () => {
        const response = await fetch(`${origin}/notifications/not-a-uuid`, { method: "PATCH" });

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ message: "Validation Failed" });
        expect(markNotificationAsReadService).not.toHaveBeenCalled();
    });

    it("passes rejected writes to the existing error handler", async () => {
        vi.mocked(markNotificationAsReadService).mockRejectedValue(new ForbiddenError());

        const response = await fetch(`${origin}/notifications/${notificationId}`, { method: "PATCH" });

        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({ message: "Forbidden" });
    });
});

describe("feature error responses", () => {
    it.each([
        [new ForbiddenError("Access denied"), 403, "Access denied"],
        [new NotFoundError("Booking not found"), 404, "Booking not found"],
        [new UnauthorizedError(), 401, "Unauthorized"],
        [new ValidationError(), 400, "Validation Failed"],
        [new Error("private database details"), 500, "Internal Server Error"],
    ])("handles a rejected service with %s", async (error, statusCode, message) => {
        vi.mocked(getMyBookingsDataService).mockRejectedValue(error);

        const response = await fetch(`${origin}/mybooking`);

        expect(response.status).toBe(statusCode);
        expect(await response.json()).toEqual({ message });
    });
});
