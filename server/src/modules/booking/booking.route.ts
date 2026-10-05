import express from "express";

import * as controller from "#app/modules/booking/booking.controller";

export const bookingRouter = express.Router();

bookingRouter.get("/calendar-data", controller.getBookingCalendarDataController);
bookingRouter.get("/events", controller.getBookingEventsController);
bookingRouter.get("/rooms", controller.getBookingRoomsController);
bookingRouter.get("/rooms/:roomId", controller.getBookingRoomController);
bookingRouter.get("/room-catalog", controller.getBookingRoomCatalogController);
bookingRouter.get("/summary", controller.getBookingSummaryController);
bookingRouter.get("/:bookingId", controller.getBookingDetailsController);
bookingRouter.post("/", controller.createBookingController);
bookingRouter.patch("/:bookingId", controller.updateBookingController);
bookingRouter.post("/:bookingId/cancel", controller.cancelBookingController);
bookingRouter.patch("/:bookingId/rsvp", controller.rsvpBookingController);
