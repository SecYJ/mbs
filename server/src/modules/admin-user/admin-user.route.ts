import express from "express";

import { adminUsersController } from "#app/modules/admin-user/admin-user.controller";

export const adminUserRouter = express.Router();

adminUserRouter.get("/", adminUsersController);
