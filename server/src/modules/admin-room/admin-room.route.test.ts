import { once } from "node:events";
import { createServer } from "node:http";

import express from "express";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ForbiddenError } from "#app/errors/forbiddenError";
import { NotFoundError } from "#app/errors/notFoundError";
import { errorHandler } from "#app/middleware/error";
import { requireAdmin } from "#app/middleware/require-admin";
import { requireAuthenticated } from "#app/middleware/require-authenticated";
import { adminRoomRouter } from "#app/modules/admin-room/admin-room.route";
import {
    createAdminRoomService,
    deleteAdminRoomService,
    getAdminRoomService,
    getAdminRoomsService,
    updateAdminRoomService,
} from "#app/modules/admin-room/admin-room.service";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("#app/lib/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("#app/modules/admin-room/admin-room.service", () => ({
    createAdminRoomService: vi.fn(),
    deleteAdminRoomService: vi.fn(),
    getAdminRoomService: vi.fn(),
    getAdminRoomsService: vi.fn(),
    updateAdminRoomService: vi.fn(),
}));

const roomId = "01990175-b8b8-7000-8000-000000000001";
const input = { name: "Alpha", location: "East Wing", capacity: 8, maxBookingDurationHours: 4, available: false };
const room = { ...input, roomId, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: null };
const services = [
    createAdminRoomService,
    deleteAdminRoomService,
    getAdminRoomService,
    getAdminRoomsService,
    updateAdminRoomService,
];
const app = express();
app.use(express.json());
app.use("/admin/rooms", requireAuthenticated, requireAdmin, adminRoomRouter);
app.use(errorHandler);
const server = createServer(app);
let origin: string;

beforeAll(async () => {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Expected an HTTP test server address");
    origin = `http://127.0.0.1:${address.port}/admin/rooms`;
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
    getSession.mockResolvedValue({ user: { id: "admin-user", role: "admin" } });
    vi.mocked(getAdminRoomsService).mockResolvedValue([{ ...room, equipment: [] }]);
    vi.mocked(getAdminRoomService).mockResolvedValue({ ...room, equipment: [] });
    vi.mocked(createAdminRoomService).mockResolvedValue({ room });
    vi.mocked(updateAdminRoomService).mockResolvedValue({ room });
    vi.mocked(deleteAdminRoomService).mockResolvedValue({ room });
});

describe("admin room routes", () => {
    it.each(["GET", "POST", "PATCH", "DELETE"])("rejects unauthenticated and non-admin %s requests", async (method) => {
        const url = method === "PATCH" || method === "DELETE" ? `${origin}/${roomId}` : origin;
        getSession.mockResolvedValue(null);
        expect((await fetch(url, { method })).status).toBe(401);
        getSession.mockResolvedValue({ user: { id: "regular-user", role: "user" } });
        expect((await fetch(url, { method })).status).toBe(403);
        for (const service of services) expect(service).not.toHaveBeenCalled();
    });

    it("parses list filters and preserves the array response", async () => {
        const response = await fetch(`${origin}?q=%20Alpha%20&status=disabled&sort=capacity-desc&view=grid`);
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual([{ ...room, equipment: [] }]);
        expect(getAdminRoomsService).toHaveBeenCalledExactlyOnceWith({
            q: "Alpha",
            status: "disabled",
            sort: "capacity-desc",
        });
    });

    it("returns 404 for a missing detail and rejects invalid IDs", async () => {
        vi.mocked(getAdminRoomService).mockRejectedValue(new NotFoundError("Room no longer exists"));
        const missing = await fetch(`${origin}/${roomId}`);
        expect(missing.status).toBe(404);
        expect(await missing.json()).toEqual({ message: "Room no longer exists" });
        const invalid = await fetch(`${origin}/invalid`);
        expect(invalid.status).toBe(400);
        expect(await invalid.json()).toEqual({ message: "Validation Failed" });
        expect(getAdminRoomService).toHaveBeenCalledExactlyOnceWith(roomId);
    });

    it.each(["POST", "PATCH"])("validates the %s body and retains numeric/boolean field types", async (method) => {
        const url = method === "PATCH" ? `${origin}/${roomId}` : origin;
        const invalidRequest = {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...input, available: "false" }),
        };
        const invalid = await fetch(url, invalidRequest);
        expect(invalid.status).toBe(400);
        expect(createAdminRoomService).not.toHaveBeenCalled();
        expect(updateAdminRoomService).not.toHaveBeenCalled();
        const validRequest = {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...input, name: " Alpha " }),
        };
        const valid = await fetch(url, validRequest);
        expect(valid.status).toBe(method === "POST" ? 201 : 200);
        expect(await valid.json()).toEqual({ room });
        if (method === "POST") expect(createAdminRoomService).toHaveBeenCalledExactlyOnceWith(input);
        else expect(updateAdminRoomService).toHaveBeenCalledExactlyOnceWith(roomId, input);
    });

    it.each([
        ["name", "x".repeat(101)],
        ["location", "x".repeat(161)],
    ])("rejects a room %s that is too long", async (field, value) => {
        const response = await fetch(origin, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...input, [field]: value }),
        });
        expect(response.status).toBe(400);
        expect(createAdminRoomService).not.toHaveBeenCalled();
    });

    it("passes the authenticated role to deletion and ignores a forged query role", async () => {
        vi.mocked(deleteAdminRoomService).mockRejectedValue(new ForbiddenError("Only super admins can delete rooms."));
        const response = await fetch(`${origin}/${roomId}?userRole=super_admin`, { method: "DELETE" });
        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({ message: "Only super admins can delete rooms." });
        expect(deleteAdminRoomService).toHaveBeenCalledExactlyOnceWith(roomId, "admin");
    });
});
