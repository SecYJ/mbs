import express from "express";

import {
    adminBookingsController,
    adminBookingStatsController,
    cancelAdminBookingController,
} from "#app/modules/admin-booking/admin-booking.controller";

export const adminBookingRouter = express.Router();

adminBookingRouter.get("/", adminBookingsController);
adminBookingRouter.get("/stats", adminBookingStatsController);
adminBookingRouter.post("/:bookingId/cancel", cancelAdminBookingController);
