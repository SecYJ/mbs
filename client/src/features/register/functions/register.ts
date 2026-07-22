import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { StatusCodes } from "http-status-codes";

import { registerServerSchema } from "@/features/register/schema/register.schema";
import { getServerApiClient } from "@/lib/server-api-client";

export const registerUserFn = createServerFn({ method: "POST" })
    .validator(registerServerSchema)
    .handler(async ({ data }) => {
        try {
            setResponseStatus(StatusCodes.CREATED);

            await getServerApiClient().post("auth/sign-up/email", { json: data }).json();
        } catch (err) {
            if (err instanceof Error) {
                setResponseStatus(StatusCodes.BAD_REQUEST);

                throw err;
            }

            throw new Error("Unable to register, Please try again.", { cause: err });
        }
    });
