import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import ky, { isHTTPError } from "ky";
import { z } from "zod";

import { env } from "@/env";
import { ServerApiError } from "@/lib/server-api-error";

const apiErrorSchema = z.object({
    message: z.string().min(1),
});

export const getServerApiClient = createServerOnlyFn(() =>
    ky.create({
        prefix: `${env.SERVER_ORIGIN}/api/${env.SERVER_API_VERSION}`,
        retry: 0,
        hooks: {
            beforeRequest: [
                ({ request, options }) => {
                    const cookie = getRequestHeader("cookie");
                    const origin = getRequestHeader("origin");

                    if (options.context.forwardCookie === false) {
                        request.headers.delete("cookie");
                    } else if (cookie) {
                        request.headers.set("cookie", cookie);
                    }

                    if (origin) {
                        request.headers.set("origin", origin);
                    }
                },
            ],
            afterResponse: [
                ({ response }) => {
                    const setCookies = response.headers.getSetCookie();

                    if (setCookies.length > 0) {
                        setResponseHeader("set-cookie", setCookies);
                    }
                },
            ],
            beforeError: [
                ({ error }) => {
                    if (isHTTPError(error)) {
                        const result = apiErrorSchema.safeParse(error.data);

                        return new ServerApiError(
                            result.success ? result.data.message : "The request could not be completed.",
                            error.response.status,
                            error.data,
                        );
                    }

                    return new ServerApiError("The service is temporarily unavailable.", null, null);
                },
            ],
        },
    }),
);
