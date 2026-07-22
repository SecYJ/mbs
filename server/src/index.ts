import { toNodeHandler } from "better-auth/node";
import express from "express";

import { env } from "#app/env";
import { auth } from "#app/lib/auth";
import { requestLogger } from "#app/middleware/request-logger";
import { notificationsRouter } from "#app/modules/notifications/notifications.route";

const app = express();

app.use(requestLogger);

app.use(`/api/${env.API_VERSION}/notifications`, notificationsRouter);

app.all(`/api/${env.API_VERSION}/auth/*splat`, toNodeHandler(auth));

app.listen(3000, () => {
    console.log("running on port 3000");
});
