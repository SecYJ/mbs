import { toNodeHandler } from "better-auth/node";
import { sql } from "drizzle-orm";
import express from "express";

import { db } from "#app/db/index";
import { env } from "#app/env";
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

const JSON_BODY_LIMIT = "100kb";

export const app = express();

app.disable("x-powered-by");
// Only the local reverse proxy (nginx, or the BFF) is trusted to set X-Forwarded-* headers.
app.set("trust proxy", "loopback");

// Registered before the request logger so frequent probes do not fill the logs.
app.get("/health", async (_req, res) => {
    try {
        await db.execute(sql`select 1`);
        res.json({ status: "ok" });
    } catch (error) {
        console.error("[health] database check failed:", error);
        res.status(503).json({ status: "unavailable" });
    }
});

app.use(requestLogger);

// Better Auth reads the request stream itself, before the application's JSON parser.
app.all(`/api/${env.API_VERSION}/auth/*splat`, toNodeHandler(auth));

app.use(express.json({ limit: JSON_BODY_LIMIT }));

app.use(`/api/${env.API_VERSION}/booking`, requireAuthenticated, bookingRouter);
app.use(`/api/${env.API_VERSION}/admin/rooms`, requireAuthenticated, requireAdmin, adminRoomRouter);
app.use(`/api/${env.API_VERSION}/admin/bookings`, requireAuthenticated, requireAdmin, adminBookingRouter);
app.use(`/api/${env.API_VERSION}/admin/users`, requireAuthenticated, requireAdmin, adminUserRouter);

app.use(`/api/${env.API_VERSION}/notifications`, requireAuthenticated, notificationRouter);

app.use(`/api/${env.API_VERSION}/mybooking`, requireAuthenticated, myBookingRouter);

app.use(errorHandler);
