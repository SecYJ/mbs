import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import type {
    BookingCalendarDataResponse,
    BookingDetailsResponse,
    BookingEventResponse,
    BookingRoomCatalogResponse,
    BookingRoomResponse,
    BookingSummaryResponse,
} from "@/features/bookings/services/booking-api.types";
import {
    cancelBookingFn,
    createBookingFn,
    getBookingCalendarDataFn,
    getBookingCalendarEventsFn,
    getBookingCalendarRoomCatalogFn,
    getBookingCalendarRoomsFn,
    getBookingDetailsFn,
    getBookingRoomFn,
    getCalendarSummaryFn,
    rsvpBookingInviteFn,
    updateBookingFn,
} from "@/features/bookings/services/fns";
import { ServerApiError } from "@/lib/server-api-error";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), json: vi.fn() }));

vi.mock("@/lib/server-api-client", () => ({ getServerApiClient: () => api }));
vi.mock("@/middleware/auth", () => ({ authenticatedUserMiddleware: {} }));
vi.mock("@tanstack/react-start", () => ({
    createServerFn() {
        let validator: { parse(input: unknown): unknown } | undefined;
        return {
            middleware() {
                return this;
            },
            validator(schema: { parse(input: unknown): unknown }) {
                validator = schema;
                return this;
            },
            handler(callback: (input: { data: unknown }) => unknown) {
                return async function invoke(input?: { data?: unknown }) {
                    return callback({ data: validator ? validator.parse(input?.data) : input?.data });
                };
            },
        };
    },
}));

const roomId = "00000000-0000-4000-8000-000000000100";
const bookingId = "00000000-0000-4000-8000-000000000001";
const range = { rangeStart: "2099-01-02T09:00:00.000Z", rangeEnd: "2099-01-02T18:00:00.000Z" };
const room: BookingRoomResponse = {
    id: roomId,
    title: "Meeting Room",
    location: "East Wing",
    capacity: 8,
    maxBookingDurationHours: 4,
    available: true,
    equipment: ["Projector"],
};
const writeInput = {
    roomId,
    title: "Planning",
    startTime: "2099-01-02T10:00:00.000Z",
    endTime: "2099-01-02T11:00:00.000Z",
    description: "Discuss next steps",
    attendeeIds: ["guest"],
};

beforeEach(() => {
    vi.resetAllMocks();
    api.get.mockReturnValue({ json: api.json });
    api.post.mockReturnValue({ json: api.json });
    api.patch.mockReturnValue({ json: api.json });
});

describe("booking BFF contracts", () => {
    it("passes calendar bootstrap data through without adding unused history", async () => {
        const response: BookingCalendarDataResponse = {
            currentUserId: "current",
            currentUserRole: "user",
            rooms: [room],
            users: [{ id: "guest", name: "Guest", email: "guest@example.test" }],
        };
        api.json.mockResolvedValue(response);

        const result = await getBookingCalendarDataFn();

        expect(api.get).toHaveBeenCalledWith("booking/calendar-data");
        expect(result).toBe(response);
        expect(result).not.toHaveProperty("history");
    });

    it.each([
        {
            name: "room",
            path: `booking/rooms/${roomId}`,
            response: room,
            call: () => getBookingRoomFn({ data: { roomId } }),
        },
        {
            name: "missing room",
            path: `booking/rooms/${roomId}`,
            response: null,
            call: () => getBookingRoomFn({ data: { roomId } }),
        },
        {
            name: "room catalog",
            path: "booking/room-catalog",
            response: { totalRoomCount: 1, allEquipment: ["Projector"], allLocations: ["East Wing"] },
            call: () => getBookingCalendarRoomCatalogFn(),
        },
        {
            name: "calendar summary",
            path: "booking/summary",
            response: { bookingCount: 1, liveBookingCount: 0 },
            call: () => getCalendarSummaryFn(),
        },
        {
            name: "booking details",
            path: `booking/${bookingId}`,
            response: {
                booking: {
                    id: bookingId,
                    title: "Planning",
                    description: "",
                    start: writeInput.startTime,
                    end: writeInput.endTime,
                    status: "active",
                    cancelledAt: null,
                    cancelReason: "",
                    createdAt: null,
                    updatedAt: null,
                },
                room: {
                    id: roomId,
                    name: "Meeting Room",
                    location: "East Wing",
                    capacity: 8,
                    maxBookingDurationHours: 4,
                    available: true,
                },
                equipment: [],
                organizer: { id: "current", name: "Current", email: "current@example.test" },
                cancelledBy: null,
                attendees: [],
                currentUserAttendance: null,
                isOrganizer: true,
                canRespond: false,
            } satisfies BookingDetailsResponse,
            call: () => getBookingDetailsFn({ data: { bookingId } }),
        },
    ])("requests the $name endpoint and preserves its response", async ({ path, response, call }) => {
        api.json.mockResolvedValue(response);

        expect(await call()).toBe(response);
        expect(api.get).toHaveBeenCalledWith(path);
    });

    it("forwards room filters as repeated query parameters, including spaces and punctuation", async () => {
        const filters = { capacity: 6, equipment: ["Projector", "TV & audio"], location: ["East Wing", "Level 2"] };
        const response = { rooms: [room] };
        api.json.mockResolvedValue(response);

        expect(await getBookingCalendarRoomsFn({ data: filters })).toBe(response);
        expect(api.get).toHaveBeenCalledWith("booking/rooms", { searchParams: expect.any(URLSearchParams) });
        const searchParams = api.get.mock.calls[0]![1].searchParams as URLSearchParams;
        expect(searchParams.get("capacity")).toBe("6");
        expect(searchParams.getAll("equipment")).toEqual(filters.equipment);
        expect(searchParams.getAll("location")).toEqual(filters.location);
        expect(new URLSearchParams(searchParams.toString()).getAll("equipment")).toEqual(filters.equipment);
    });

    it("forwards calendar ranges with repeated filters and passes event data through", async () => {
        const response: BookingEventResponse[] = [
            {
                id: bookingId,
                resourceId: roomId,
                title: "Planning",
                start: writeInput.startTime,
                end: writeInput.endTime,
                extendedProps: {
                    resourceId: roomId,
                    organizer: "Current",
                    attendees: ["Guest"],
                    attendeeIds: ["guest"],
                    description: "",
                    canManage: true,
                },
            },
        ];
        const filters = { capacity: 6, equipment: ["Projector", "Whiteboard"], location: ["East Wing", "West Wing"] };
        api.json.mockResolvedValue(response);

        expect(await getBookingCalendarEventsFn({ data: { ...range, ...filters } })).toBe(response);
        expect(api.get).toHaveBeenCalledWith("booking/events", { searchParams: expect.any(URLSearchParams) });
        const searchParams = api.get.mock.calls[0]![1].searchParams as URLSearchParams;
        expect(searchParams.get("rangeStart")).toBe(range.rangeStart);
        expect(searchParams.get("rangeEnd")).toBe(range.rangeEnd);
        expect(searchParams.get("capacity")).toBe("6");
        expect(searchParams.getAll("equipment")).toEqual(filters.equipment);
        expect(searchParams.getAll("location")).toEqual(filters.location);
        expect(searchParams.has("roomId")).toBe(false);
    });

    it("forwards a single-room event scope and defaults omitted filters", async () => {
        api.json.mockResolvedValue([]);

        expect(await getBookingCalendarEventsFn({ data: { ...range, roomId } })).toEqual([]);
        const searchParams = api.get.mock.calls[0]![1].searchParams as URLSearchParams;
        expect(searchParams.get("roomId")).toBe(roomId);
        expect(searchParams.get("capacity")).toBe("0");
        expect(searchParams.getAll("equipment")).toEqual([]);
        expect(searchParams.getAll("location")).toEqual([]);
    });

    it.each([
        {
            name: "create",
            method: "post",
            path: "booking",
            body: writeInput,
            call: () => createBookingFn({ data: writeInput }),
        },
        {
            name: "update",
            method: "patch",
            path: `booking/${bookingId}`,
            body: writeInput,
            call: () => updateBookingFn({ data: { ...writeInput, bookingId } }),
        },
        {
            name: "cancel",
            method: "post",
            path: `booking/${bookingId}/cancel`,
            body: { cancelReason: "Schedule changed" },
            call: () => cancelBookingFn({ data: { bookingId, cancelReason: "Schedule changed" } }),
        },
        {
            name: "RSVP",
            method: "patch",
            path: `booking/${bookingId}/rsvp`,
            body: { status: "accepted" },
            call: () => rsvpBookingInviteFn({ data: { bookingId, status: "accepted" } }),
        },
    ] as const)(
        "forwards the $name mutation with its method, path ID, and JSON body",
        async ({ method, path, body, call }) => {
            const response = { id: bookingId };
            api.json.mockResolvedValue(response);

            expect(await call()).toBe(response);
            expect(api[method]).toHaveBeenCalledWith(path, { json: body });
            expect(api[method]).toHaveBeenCalledTimes(1);
        },
    );

    it.each([
        { name: "read", call: () => getBookingDetailsFn({ data: { bookingId } }) },
        { name: "write", call: () => cancelBookingFn({ data: { bookingId } }) },
    ])("preserves API errors from a $name operation", async ({ call }) => {
        const error = new ServerApiError("Booking no longer exists", 404, { message: "Booking no longer exists" });
        api.json.mockRejectedValue(error);

        await expect(call()).rejects.toBe(error);
    });

    it("retains response types required by existing calendar and details callers", () => {
        expectTypeOf<
            Awaited<ReturnType<typeof getBookingCalendarDataFn>>
        >().toEqualTypeOf<BookingCalendarDataResponse>();
        expectTypeOf<Awaited<ReturnType<typeof getBookingCalendarEventsFn>>>().toEqualTypeOf<BookingEventResponse[]>();
        expectTypeOf<Awaited<ReturnType<typeof getBookingCalendarRoomsFn>>>().toEqualTypeOf<{
            rooms: BookingRoomResponse[];
        }>();
        expectTypeOf<Awaited<ReturnType<typeof getBookingRoomFn>>>().toEqualTypeOf<BookingRoomResponse | null>();
        expectTypeOf<
            Awaited<ReturnType<typeof getBookingCalendarRoomCatalogFn>>
        >().toEqualTypeOf<BookingRoomCatalogResponse>();
        expectTypeOf<Awaited<ReturnType<typeof getCalendarSummaryFn>>>().toEqualTypeOf<BookingSummaryResponse>();
        expectTypeOf<Awaited<ReturnType<typeof getBookingDetailsFn>>>().toEqualTypeOf<BookingDetailsResponse>();
    });
});
