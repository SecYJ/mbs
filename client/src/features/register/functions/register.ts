import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { status } from "http-status";

import { registerServerSchema } from "@/features/register/schema/register.schema";
import { getServerApiClient } from "@/lib/server-api-client";

export const registerUserFn = createServerFn({ method: "POST" })
    .validator(registerServerSchema)
    .handler(async ({ data }) => {
        try {
            setResponseStatus(status.CREATED);

            await getServerApiClient().post("auth/sign-up/email", { json: data }).json();
        } catch (err) {
            if (err instanceof Error) {
                setResponseStatus(status.BAD_REQUEST);

                throw err;
            }

            throw new Error("Unable to register, Please try again.", { cause: err });
        }
    });
