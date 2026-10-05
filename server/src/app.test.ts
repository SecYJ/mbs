import { once } from "node:events";
import { createServer } from "node:http";

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { app } from "#app/app";
import * as adminBooking from "#app/modules/admin-booking/admin-booking.service";
import * as adminRoom from "#app/modules/admin-room/admin-room.service";
import * as adminUser from "#app/modules/admin-user/admin-user.service";
import * as booking from "#app/modules/booking/booking.service";
import * as mybooking from "#app/modules/mybooking/mybooking.service";
import * as notification from "#app/modules/notification/notification.service";

const { getSession, authHandler } = vi.hoisted(() => ({ getSession: vi.fn(), authHandler: vi.fn() }));

vi.mock("#app/env", () => ({ env: { API_VERSION: "v1" } }));
vi.mock("#app/lib/auth", () => ({ auth: { api: { getSession }, handler: authHandler } }));
vi.mock("#app/modules/booking/booking.service", () => ({
    getBookingCalendarDataService: vi.fn(),
    getBookingEventsService: vi.fn(),
    getBookingRoomsService: vi.fn(),
    getBookingRoomService: vi.fn(),
    getBookingRoomCatalogService: vi.fn(),
    getBookingSummaryService: vi.fn(),
    getBookingDetailsService: vi.fn(),
    createBookingService: vi.fn(),
    updateBookingService: vi.fn(),
    cancelBookingService: vi.fn(),
    rsvpBookingService: vi.fn(),
}));
vi.mock("#app/modules/admin-room/admin-room.service", () => ({
    getAdminRoomsService: vi.fn(),
    getAdminRoomService: vi.fn(),
    createAdminRoomService: vi.fn(),
    updateAdminRoomService: vi.fn(),
    deleteAdminRoomService: vi.fn(),
}));
vi.mock("#app/modules/admin-booking/admin-booking.service", () => ({
    getAdminBookingsService: vi.fn(),
    getAdminBookingStatsService: vi.fn(),
    cancelAdminBookingService: vi.fn(),
}));
vi.mock("#app/modules/admin-user/admin-user.service", () => ({ getAdminUsersService: vi.fn() }));
vi.mock("#app/modules/mybooking/mybooking.service", () => ({
    getMyBookingsDataService: vi.fn(),
    getMyBookingStatsService: vi.fn(),
}));
vi.mock("#app/modules/notification/notification.service", () => ({
    getNotificationsService: vi.fn(),
    markAllNotificationsAsReadService: vi.fn(),
    markNotificationAsReadService: vi.fn(),
}));

const bookingId = "01990175-b8b8-7000-8000-000000000001";
const roomId = "01990175-b8b8-7000-8000-000000000002";
const bookingInput = {
    title: "Planning",
    roomId,
    startTime: "2099-09-20T12:00:00.000Z",
    endTime: "2099-09-20T13:00:00.000Z",
    attendeeIds: ["guest-id"],
};
const adminPaths = [
    ["GET", "/admin/rooms"],
    ["GET", `/admin/rooms/${roomId}`],
    ["POST", "/admin/rooms"],
    ["PATCH", `/admin/rooms/${roomId}`],
    ["DELETE", `/admin/rooms/${roomId}`],
    ["GET", "/admin/bookings"],
    ["GET", "/admin/bookings/stats"],
    ["POST", `/admin/bookings/${bookingId}/cancel`],
    ["GET", "/admin/users"],
] as const;
const protectedPaths = [
    ["GET", "/booking/calendar-data"],
    ["GET", "/booking/events"],
    ["GET", "/booking/rooms"],
    ["GET", `/booking/rooms/${roomId}`],
    ["GET", "/booking/room-catalog"],
    ["GET", "/booking/summary"],
    ["GET", `/booking/${bookingId}`],
    ["POST", "/booking"],
    ["PATCH", `/booking/${bookingId}`],
    ["POST", `/booking/${bookingId}/cancel`],
    ["PATCH", `/booking/${bookingId}/rsvp`],
    ...adminPaths,
] as const;
const services = [booking, adminBooking, adminRoom, adminUser, mybooking, notification].flatMap(Object.values);
const server = createServer(app);
let origin: string;

beforeAll(async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Expected an HTTP server address");
    origin = `http://127.0.0.1:${address.port}/api/v1`;
});

afterAll(async () => {
    if (server.listening) {
        const closed = once(server, "close");
        server.close();
        await closed;
    }
    vi.restoreAllMocks();
});

beforeEach(() => {
    vi.resetAllMocks();
    getSession.mockResolvedValue({ user: { id: "session-user", role: "user" } });
});

describe("mounted application access rules", () => {
    it.each(protectedPaths)("requires a session for %s %s", async (method, path) => {
        getSession.mockResolvedValue(null);

        const response = await fetch(`${origin}${path}`, { method });

        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ message: "Unauthorized" });
        for (const service of services) expect(service).not.toHaveBeenCalled();
    });

    it("retains authentication on Mybooking and notification routes", async () => {
        getSession.mockResolvedValue(null);

        for (const [method, path] of [
            ["GET", "/mybooking"],
            ["GET", "/mybooking/stats"],
            ["GET", "/notifications"],
            ["PATCH", "/notifications"],
            ["PATCH", `/notifications/${bookingId}`],
        ]) {
            const response = await fetch(`${origin}${path}`, { method });
            expect(response.status).toBe(401);
            expect(await response.json()).toEqual({ message: "Unauthorized" });
        }
        for (const service of services) expect(service).not.toHaveBeenCalled();
    });

    it("rejects ordinary users on every mounted admin route before invoking a service", async () => {
        for (const [method, path] of adminPaths) {
            const response = await fetch(`${origin}${path}`, { method });
            expect(response.status).toBe(403);
            expect(await response.json()).toEqual({ message: "Forbidden" });
        }
        for (const service of services) expect(service).not.toHaveBeenCalled();
    });
});

describe("mounted application request handling", () => {
    it("passes the original JSON stream to Better Auth before the application body parser", async () => {
        authHandler.mockImplementation(async (request: Request) => {
            return Response.json({ rawBody: await request.text(), method: request.method });
        });
        const rawBody = '{ "email" : "person@example.test", "password" : "test-password" }';

        const response = await fetch(`${origin}/auth/sign-in/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: rawBody,
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ rawBody, method: "POST" });
        expect(authHandler).toHaveBeenCalledOnce();
        expect(getSession).not.toHaveBeenCalled();
    });

    it("parses booking JSON and uses the session identity when creating a booking", async () => {
        vi.mocked(booking.createBookingService).mockResolvedValue({ id: bookingId });

        const response = await fetch(`${origin}/booking`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...bookingInput, userId: "spoofed-user", userRole: "super_admin" }),
        });

        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ id: bookingId });
        expect(booking.createBookingService).toHaveBeenCalledExactlyOnceWith("session-user", bookingInput);
    });

    it("parses admin room JSON and returns 201 with the existing room response", async () => {
        getSession.mockResolvedValue({ user: { id: "session-user", role: "admin" } });
        const input = { name: "Room", location: "East", capacity: 4, maxBookingDurationHours: 2, available: true };
        const result = { room: { ...input, roomId, createdAt: null, updatedAt: null } };
        vi.mocked(adminRoom.createAdminRoomService).mockResolvedValue(result);

        const response = await fetch(`${origin}/admin/rooms`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });

        expect(response.status).toBe(201);
        expect(await response.json()).toEqual(result);
        expect(adminRoom.createAdminRoomService).toHaveBeenCalledExactlyOnceWith(input);
    });

    it("uses route IDs and session identity for update, cancellation, and RSVP mutations", async () => {
        getSession.mockResolvedValue({ user: { id: "session-user", role: "super_admin" } });
        const mutations = [
            ["PATCH", `/booking/${bookingId}`, bookingInput, booking.updateBookingService],
            ["POST", `/booking/${bookingId}/cancel`, { cancelReason: "Room closed" }, booking.cancelBookingService],
            ["PATCH", `/booking/${bookingId}/rsvp`, { status: "accepted" }, booking.rsvpBookingService],
            [
                "POST",
                `/admin/bookings/${bookingId}/cancel`,
                { cancelReason: "Room closed" },
                adminBooking.cancelAdminBookingService,
            ],
        ] as const;

        for (const [method, path, input, service] of mutations) {
            vi.mocked(service).mockResolvedValue({ id: bookingId });
            const response = await fetch(`${origin}${path}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...input, bookingId: "spoofed-id", userId: "spoofed-user", userRole: "user" }),
            });
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ id: bookingId });
            const expectedInput = { ...input, bookingId };
            if (path.endsWith("/cancel")) {
                expect(service).toHaveBeenCalledExactlyOnceWith("session-user", "super_admin", expectedInput);
            } else {
                expect(service).toHaveBeenCalledExactlyOnceWith("session-user", expectedInput);
            }
        }
    });

    it("returns the established 400 response for malformed JSON, invalid fields, and invalid IDs before writes", async () => {
        getSession.mockResolvedValue({ user: { id: "session-user", role: "admin" } });
        for (const [method, path, body] of [
            ["POST", "/booking", '{"title":'],
            ["POST", "/booking", JSON.stringify({ ...bookingInput, attendeeIds: "guest-id" })],
            ["PATCH", `/booking/${bookingId}`, JSON.stringify({ ...bookingInput, roomId: "invalid" })],
            ["POST", "/booking/invalid/cancel", "{}"],
            ["PATCH", `/booking/${bookingId}/rsvp`, JSON.stringify({ status: "pending" })],
            ["POST", "/admin/rooms", JSON.stringify({ name: "Room", capacity: "4" })],
            ["POST", `/admin/bookings/${bookingId}/cancel`, JSON.stringify({ cancelReason: "x".repeat(501) })],
        ]) {
            const response = await fetch(`${origin}${path}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body,
            });
            expect(response.status).toBe(400);
            expect(await response.json()).toEqual({ message: "Validation Failed" });
        }
        for (const service of services) expect(service).not.toHaveBeenCalled();
    });

    it("routes static booking paths before booking IDs and passes only session context", async () => {
        vi.mocked(booking.getBookingSummaryService).mockResolvedValue({ bookingCount: 2, liveBookingCount: 1 });
        vi.mocked(booking.getBookingRoomCatalogService).mockResolvedValue({
            totalRoomCount: 0,
            allEquipment: [],
            allLocations: [],
        });
        vi.mocked(booking.getBookingRoomsService).mockResolvedValue({ rooms: [] });
        vi.mocked(booking.getBookingCalendarDataService).mockResolvedValue({
            currentUserId: "session-user",
            currentUserRole: "user",
            rooms: [],
            users: [],
        });
        vi.mocked(booking.getBookingEventsService).mockResolvedValue([]);
        vi.mocked(booking.getBookingRoomService).mockResolvedValue({
            id: roomId,
            title: "Room",
            location: "East",
            capacity: 4,
            maxBookingDurationHours: 2,
            available: true,
            equipment: [],
        });

        for (const [path, service] of [
            ["/booking/summary", booking.getBookingSummaryService],
            ["/booking/room-catalog", booking.getBookingRoomCatalogService],
            ["/booking/rooms?capacity=2&equipment=TV&equipment=Screen&location=East", booking.getBookingRoomsService],
            ["/booking/calendar-data?userId=spoofed-user&userRole=super_admin", booking.getBookingCalendarDataService],
            [
                `/booking/events?rangeStart=${bookingInput.startTime}&rangeEnd=${bookingInput.endTime}`,
                booking.getBookingEventsService,
            ],
            [`/booking/rooms/${roomId}`, booking.getBookingRoomService],
        ] as const) {
            const response = await fetch(`${origin}${path}`);
            expect(response.status).toBe(200);
            await response.json();
            expect(service).toHaveBeenCalledOnce();
        }
        expect(booking.getBookingCalendarDataService).toHaveBeenCalledExactlyOnceWith("session-user", "user");
        expect(booking.getBookingRoomsService).toHaveBeenCalledExactlyOnceWith({
            capacity: 2,
            equipment: ["TV", "Screen"],
            location: ["East"],
        });
        expect(booking.getBookingRoomService).toHaveBeenCalledExactlyOnceWith(roomId);
        expect(booking.getBookingDetailsService).not.toHaveBeenCalled();
    });
});
