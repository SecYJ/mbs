import { beforeEach, describe, expect, it, vi } from "vitest";

import { createRoomFn, deleteRoomFn, getRoomFn, getRoomsFn, updateRoomFn } from "@/features/admin/services/rooms/fns";

const { get, post, patch, remove, json } = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    remove: vi.fn(),
    json: vi.fn(),
}));

vi.mock("@tanstack/react-start", () => ({
    createServerFn() {
        return {
            middleware() {
                return this;
            },
            validator() {
                return this;
            },
            handler(handler: (options: { data: unknown }) => unknown) {
                return handler;
            },
        };
    },
}));

vi.mock("@/middleware/auth", () => ({ adminUserMiddleware: {} }));

vi.mock("@/lib/server-api-client", () => ({
    getServerApiClient() {
        return { get, post, patch, delete: remove };
    },
}));

const roomId = "01990175-b8b8-7000-8000-000000000001";
const input = { name: "Alpha", location: "East Wing", capacity: 8, maxBookingDurationHours: 4, available: false };
const room = { ...input, roomId, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: null };

beforeEach(() => {
    vi.resetAllMocks();
    for (const request of [get, post, patch, remove]) request.mockReturnValue({ json });
});

describe("admin room request forwarding", () => {
    it("forwards server filters and restores room dates without changing equipment", async () => {
        const equipment = [{ id: "projector", name: "Projector", brand: "Acme", model: "P1", quantity: 2 }];
        json.mockResolvedValue([{ ...room, equipment }]);

        const result = await getRoomsFn({ data: { q: "Alpha", status: "disabled", sort: "name-asc", view: "grid" } });

        expect(get).toHaveBeenCalledExactlyOnceWith("admin/rooms", {
            searchParams: { q: "Alpha", status: "disabled", sort: "name-asc" },
        });
        expect(result).toEqual([{ ...room, createdAt: new Date(room.createdAt), equipment }]);
    });

    it("preserves null room details and nullable timestamps", async () => {
        json.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...room, createdAt: null, equipment: [] });
        expect(await getRoomFn({ data: { roomId } })).toBeNull();
        expect(await getRoomFn({ data: { roomId } })).toEqual({ ...room, createdAt: null, equipment: [] });
        expect(get).toHaveBeenCalledWith(`admin/rooms/${roomId}`);
    });

    it("forwards create, update, and delete to their HTTP methods and preserves mutation results", async () => {
        json.mockResolvedValue({ room });
        const expected = { room: { ...room, createdAt: new Date(room.createdAt) } };

        expect(await createRoomFn({ data: input })).toEqual(expected);
        expect(post).toHaveBeenCalledExactlyOnceWith("admin/rooms", { json: input });
        expect(await updateRoomFn({ data: { ...input, roomId } })).toEqual(expected);
        expect(patch).toHaveBeenCalledExactlyOnceWith(`admin/rooms/${roomId}`, { json: input });
        expect(await deleteRoomFn({ data: { roomId } })).toEqual(expected);
        expect(remove).toHaveBeenCalledExactlyOnceWith(`admin/rooms/${roomId}`);
    });

    it("preserves API errors for existing client error messages", async () => {
        json.mockRejectedValue(new Error("Only super admins can delete rooms."));
        await expect(deleteRoomFn({ data: { roomId } })).rejects.toThrow("Only super admins can delete rooms.");
    });
});
