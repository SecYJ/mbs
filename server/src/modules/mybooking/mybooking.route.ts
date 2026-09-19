import express from "express";

import { myBookingStatsController, myBookingsDataController } from "#app/modules/mybooking/mybooking.controller";

export const myBookingRouter = express.Router();

myBookingRouter.get("/", myBookingsDataController);

myBookingRouter.get("/stats", myBookingStatsController);
