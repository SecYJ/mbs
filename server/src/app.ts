import { toNodeHandler } from "better-auth/node";
import express from "express";

import { env } from "#app/env";
import { NotFoundError } from "#app/errors/notFoundError";
import { auth } from "#app/lib/auth";
import { errorHandler } from "#app/middleware/error";
import { requestLogger } from "#app/middleware/request-logger";
import { requireAuthenticated } from "#app/middleware/require-authenticated";
import { notificationRouter } from "#app/modules/notification/notification.route";

const app = express();

app.use(requestLogger);

app.use(`/api/${env.API_VERSION}/notifications`, requireAuthenticated, notificationRouter);

app.all(`/api/${env.API_VERSION}/auth/*splat`, toNodeHandler(auth));

app.get(`/api/${env.API_VERSION}/error-demo`, () => {
    throw new NotFoundError("bodoh");
});

app.use(errorHandler);

app.listen(3000, () => {
    console.log("running on port 3000");
});
