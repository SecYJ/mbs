import { toNodeHandler } from "better-auth/node";
import express from "express";

import { env } from "#app/env";
import { NotFoundError } from "#app/errors/notFoundError";
import { auth } from "#app/lib/auth";
import { errorHandler } from "#app/middleware/error";
import { requestLogger } from "#app/middleware/request-logger";
import { requireAdmin } from "#app/middleware/require-admin";
import { requireAuthenticated } from "#app/middleware/require-authenticated";
import { adminBookingRouter } from "#app/modules/admin-booking/admin-booking.route";
import { adminRoomRouter } from "#app/modules/admin-room/admin-room.route";
import { adminUserRouter } from "#app/modules/admin-user/admin-user.route";
import { bookingRouter } from "#app/modules/booking/booking.route";
import { myBookingRouter } from "#app/modules/mybooking/mybooking.route";
import { notificationRouter } from "#app/modules/notification/notification.route";

export const app = express();

app.use(requestLogger);

// Better Auth reads the request stream itself, before the application's JSON parser.
app.all(`/api/${env.API_VERSION}/auth/*splat`, toNodeHandler(auth));

app.use(express.json());

app.use(`/api/${env.API_VERSION}/booking`, requireAuthenticated, bookingRouter);
app.use(`/api/${env.API_VERSION}/admin/rooms`, requireAuthenticated, requireAdmin, adminRoomRouter);
app.use(`/api/${env.API_VERSION}/admin/bookings`, requireAuthenticated, requireAdmin, adminBookingRouter);
app.use(`/api/${env.API_VERSION}/admin/users`, requireAuthenticated, requireAdmin, adminUserRouter);

app.use(`/api/${env.API_VERSION}/notifications`, requireAuthenticated, notificationRouter);

app.use(`/api/${env.API_VERSION}/mybooking`, requireAuthenticated, myBookingRouter);

app.get(`/api/${env.API_VERSION}/error-demo`, () => {
    throw new NotFoundError("bodoh");
});

app.use(errorHandler);
