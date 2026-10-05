import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
    cancelBookingSchema,
    createBookingSchema,
    updateBookingSchema,
} from "@/features/bookings/schemas/booking.schema";
import type {
    BookingCalendarDataResponse,
    BookingDetailsResponse,
    BookingEventResponse,
    BookingRoomCatalogResponse,
    BookingRoomResponse,
    BookingSummaryResponse,
} from "@/features/bookings/services/booking-api.types";
import type { RoomFilters } from "@/features/bookings/services/queries";
import { getServerApiClient } from "@/lib/server-api-client";
import { authenticatedUserMiddleware } from "@/middleware/auth";

const roomFiltersSchema = z.object({
    capacity: z.number().int().min(0),
    equipment: z.string().array(),
    location: z.string().array(),
});

function getRoomFilterSearchParams(filters: RoomFilters) {
    const searchParams = new URLSearchParams({ capacity: String(filters.capacity) });
    for (const equipment of filters.equipment) {
        searchParams.append("equipment", equipment);
    }
    for (const location of filters.location) {
        searchParams.append("location", location);
    }
    return searchParams;
}

export const getBookingCalendarDataFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .handler(async () => {
        return getServerApiClient().get("booking/calendar-data").json<BookingCalendarDataResponse>();
    });

export const getBookingCalendarEventsFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .validator(
        z.object({
            rangeStart: z.iso.datetime(),
            rangeEnd: z.iso.datetime(),
            roomId: z.uuid().optional(),
            capacity: z.number().int().min(0).default(0),
            equipment: z.string().array().default([]),
            location: z.string().array().default([]),
        }),
    )
    .handler(async ({ data }) => {
        const searchParams = getRoomFilterSearchParams(data);
        searchParams.set("rangeStart", data.rangeStart);
        searchParams.set("rangeEnd", data.rangeEnd);
        if (data.roomId) {
            searchParams.set("roomId", data.roomId);
        }
        return getServerApiClient().get("booking/events", { searchParams }).json<BookingEventResponse[]>();
    });

export const getBookingCalendarRoomsFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .validator(roomFiltersSchema)
    .handler(async ({ data }) => {
        return getServerApiClient()
            .get("booking/rooms", { searchParams: getRoomFilterSearchParams(data) })
            .json<{ rooms: BookingRoomResponse[] }>();
    });

export const getBookingRoomFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .validator(z.object({ roomId: z.uuid() }))
    .handler(async ({ data }) => {
        return getServerApiClient().get(`booking/rooms/${data.roomId}`).json<BookingRoomResponse | null>();
    });

export const getBookingCalendarRoomCatalogFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .handler(async () => {
        return getServerApiClient().get("booking/room-catalog").json<BookingRoomCatalogResponse>();
    });

export const getCalendarSummaryFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .handler(async () => {
        return getServerApiClient().get("booking/summary").json<BookingSummaryResponse>();
    });

export const getBookingDetailsFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .validator(z.object({ bookingId: z.uuid() }))
    .handler(async ({ data }) => {
        return getServerApiClient().get(`booking/${data.bookingId}`).json<BookingDetailsResponse>();
    });

export const rsvpBookingInviteFn = createServerFn({ method: "POST" })
    .middleware([authenticatedUserMiddleware])
    .validator(z.object({ bookingId: z.uuid(), status: z.enum(["accepted", "declined"]) }))
    .handler(async ({ data }) => {
        return getServerApiClient()
            .patch(`booking/${data.bookingId}/rsvp`, { json: { status: data.status } })
            .json<{ id: string }>();
    });

export const createBookingFn = createServerFn({ method: "POST" })
    .middleware([authenticatedUserMiddleware])
    .validator(createBookingSchema)
    .handler(async ({ data }) => {
        return getServerApiClient().post("booking", { json: data }).json<{ id: string }>();
    });

export const updateBookingFn = createServerFn({ method: "POST" })
    .middleware([authenticatedUserMiddleware])
    .validator(updateBookingSchema)
    .handler(async ({ data: { bookingId, ...data } }) => {
        return getServerApiClient().patch(`booking/${bookingId}`, { json: data }).json<{ id: string }>();
    });

export const cancelBookingFn = createServerFn({ method: "POST" })
    .middleware([authenticatedUserMiddleware])
    .validator(cancelBookingSchema)
    .handler(async ({ data: { bookingId, ...data } }) => {
        return getServerApiClient().post(`booking/${bookingId}/cancel`, { json: data }).json<{ id: string }>();
    });
