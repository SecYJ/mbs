import { once } from "node:events";
import { createServer } from "node:http";

import express from "express";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ForbiddenError } from "#app/errors/forbiddenError";
import { errorHandler } from "#app/middleware/error";
import { requireAdmin } from "#app/middleware/require-admin";
import { requireAuthenticated } from "#app/middleware/require-authenticated";
import { adminBookingRouter } from "#app/modules/admin-booking/admin-booking.route";
import {
    cancelAdminBookingService,
    getAdminBookingsService,
    getAdminBookingStatsService,
} from "#app/modules/admin-booking/admin-booking.service";
import { adminUserRouter } from "#app/modules/admin-user/admin-user.route";
import { getAdminUsersService } from "#app/modules/admin-user/admin-user.service";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("#app/lib/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("#app/modules/admin-booking/admin-booking.service", () => ({
    getAdminBookingsService: vi.fn(),
    getAdminBookingStatsService: vi.fn(),
    cancelAdminBookingService: vi.fn(),
}));
vi.mock("#app/modules/admin-user/admin-user.service", () => ({ getAdminUsersService: vi.fn() }));

const bookingId = "01990175-b8b8-7000-8000-000000000001";
const services = [
    getAdminBookingsService,
    getAdminBookingStatsService,
    cancelAdminBookingService,
    getAdminUsersService,
];
const app = express();
app.use(express.json());
app.use("/admin/bookings", requireAuthenticated, requireAdmin, adminBookingRouter);
app.use("/admin/users", requireAuthenticated, requireAdmin, adminUserRouter);
app.use(errorHandler);

const server = createServer(app);
let origin: string;

beforeAll(async () => {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Expected an HTTP server address");
    origin = `http://127.0.0.1:${address.port}`;
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
    getSession.mockResolvedValue({ user: { id: "admin-id", role: "admin" } });
    vi.mocked(getAdminBookingsService).mockResolvedValue({
        currentUserId: "admin-id",
        currentUserRole: "admin",
        bookings: [],
        rooms: [],
    });
    vi.mocked(getAdminBookingStatsService).mockResolvedValue({ popularRoom: null, todayCount: 0, weekCount: 0 });
    vi.mocked(cancelAdminBookingService).mockResolvedValue({ id: bookingId });
    vi.mocked(getAdminUsersService).mockResolvedValue([]);
});

describe("admin feature authorization", () => {
    it.each([
        ["GET", "/admin/bookings"],
        ["GET", "/admin/bookings/stats"],
        ["POST", `/admin/bookings/${bookingId}/cancel`],
        ["GET", "/admin/users"],
    ])("rejects unauthenticated and ordinary users for %s %s", async (method, path) => {
        for (const [session, status] of [
            [null, 401],
            [{ user: { id: "ordinary-user", role: "user" } }, 403],
        ] as const) {
            getSession.mockResolvedValue(session);
            const response = await fetch(`${origin}${path}`, { method });

            expect(response.status).toBe(status);
            for (const service of services) expect(service).not.toHaveBeenCalled();
        }
    });

    it.each(["admin", "super_admin"])("uses the authenticated %s identity rather than request fields", async (role) => {
        getSession.mockResolvedValue({ user: { id: "admin-id", role } });

        const response = await fetch(`${origin}/admin/bookings?userId=someone-else&userRole=super_admin`);

        expect(response.status).toBe(200);
        expect(getAdminBookingsService).toHaveBeenCalledExactlyOnceWith("admin-id", role, {
            q: "",
            room: "all",
            status: "all",
        });
    });
});

describe("admin booking contracts", () => {
    it("preserves filters, trims search, and returns the existing list shape", async () => {
        const query = new URLSearchParams({ q: "  Planning & review  ", room: "Blue room", status: "in-progress" });

        const response = await fetch(`${origin}/admin/bookings?${query}`);

        expect(await response.json()).toEqual({
            currentUserId: "admin-id",
            currentUserRole: "admin",
            bookings: [],
            rooms: [],
        });
        expect(getAdminBookingsService).toHaveBeenCalledExactlyOnceWith("admin-id", "admin", {
            q: "Planning & review",
            room: "Blue room",
            status: "in-progress",
        });
    });

    it("preserves query fallbacks and zero/null statistics", async () => {
        await fetch(`${origin}/admin/bookings?status=unknown&q=one&q=two&room=one&room=two`);
        expect(getAdminBookingsService).toHaveBeenCalledExactlyOnceWith("admin-id", "admin", {
            q: "",
            room: "all",
            status: "all",
        });

        const response = await fetch(`${origin}/admin/bookings/stats`);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ popularRoom: null, todayCount: 0, weekCount: 0 });
    });

    it("uses the booking ID in the route and validates cancellation input", async () => {
        const response = await fetch(`${origin}/admin/bookings/${bookingId}/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId: "untrusted-body-id", cancelReason: "  Room unavailable  " }),
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ id: bookingId });
        expect(cancelAdminBookingService).toHaveBeenCalledExactlyOnceWith("admin-id", "admin", {
            bookingId,
            cancelReason: "Room unavailable",
        });
    });

    it.each([
        ["invalid-id", "Reason"],
        [bookingId, "x".repeat(501)],
    ])("rejects malformed cancellation input", async (id, cancelReason) => {
        const response = await fetch(`${origin}/admin/bookings/${id}/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cancelReason }),
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ message: "Validation Failed" });
        expect(cancelAdminBookingService).not.toHaveBeenCalled();
    });

    it("preserves authorization errors from cancellation", async () => {
        vi.mocked(cancelAdminBookingService).mockRejectedValue(new ForbiddenError("Only the creator can cancel"));

        const response = await fetch(`${origin}/admin/bookings/${bookingId}/cancel`, { method: "POST" });

        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({ message: "Only the creator can cancel" });
    });
});

describe("admin user contracts", () => {
    it("preserves the array response and forwards literal search and last-login ordering", async () => {
        const query = new URLSearchParams({ q: "50%_\\", sort: "lastLogin", dir: "desc" });

        const response = await fetch(`${origin}/admin/users?${query}`);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual([]);
        expect(getAdminUsersService).toHaveBeenCalledExactlyOnceWith({ q: "50%_\\", sort: "lastLogin", dir: "desc" });
    });

    it("preserves default alphabetical sorting for invalid query values", async () => {
        await fetch(`${origin}/admin/users?sort=invalid&dir=invalid&q=one&q=two`);

        expect(getAdminUsersService).toHaveBeenCalledExactlyOnceWith({ q: undefined, sort: "name", dir: "asc" });
    });
});
