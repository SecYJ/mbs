import type { Request } from "express";

import {
    bookingEventsSchema,
    bookingIdSchema,
    bookingRoomFiltersSchema,
    bookingRoomIdSchema,
    bookingRsvpSchema,
    cancelBookingSchema,
    createBookingSchema,
    updateBookingSchema,
} from "#app/modules/booking/booking.schema";
import * as service from "#app/modules/booking/booking.service";
import type { AuthenticatedResponse } from "#app/types";

export async function getBookingCalendarDataController(_req: Request, res: AuthenticatedResponse) {
    res.json(await service.getBookingCalendarDataService(res.locals.userId, res.locals.userRole));
}

export async function getBookingEventsController(req: Request, res: AuthenticatedResponse) {
    res.json(await service.getBookingEventsService(res.locals.userId, bookingEventsSchema.parse(req.query)));
}

export async function getBookingRoomsController(req: Request, res: AuthenticatedResponse) {
    res.json(await service.getBookingRoomsService(bookingRoomFiltersSchema.parse(req.query)));
}

export async function getBookingRoomController(req: Request, res: AuthenticatedResponse) {
    const { roomId } = bookingRoomIdSchema.parse(req.params);
    res.json(await service.getBookingRoomService(roomId));
}

export async function getBookingRoomCatalogController(_req: Request, res: AuthenticatedResponse) {
    res.json(await service.getBookingRoomCatalogService());
}

export async function getBookingSummaryController(_req: Request, res: AuthenticatedResponse) {
    res.json(await service.getBookingSummaryService());
}

export async function getBookingDetailsController(req: Request, res: AuthenticatedResponse) {
    const { bookingId } = bookingIdSchema.parse(req.params);
    res.json(await service.getBookingDetailsService(res.locals.userId, bookingId));
}

export async function createBookingController(req: Request, res: AuthenticatedResponse) {
    res.status(201).json(await service.createBookingService(res.locals.userId, createBookingSchema.parse(req.body)));
}

export async function updateBookingController(req: Request, res: AuthenticatedResponse) {
    const input = updateBookingSchema.parse({ ...req.body, ...bookingIdSchema.parse(req.params) });
    res.json(await service.updateBookingService(res.locals.userId, input));
}

export async function cancelBookingController(req: Request, res: AuthenticatedResponse) {
    const input = cancelBookingSchema.parse({ ...req.body, ...bookingIdSchema.parse(req.params) });
    res.json(await service.cancelBookingService(res.locals.userId, res.locals.userRole, input));
}

export async function rsvpBookingController(req: Request, res: AuthenticatedResponse) {
    const input = bookingRsvpSchema.parse({ ...req.body, ...bookingIdSchema.parse(req.params) });
    res.json(await service.rsvpBookingService(res.locals.userId, input));
}
