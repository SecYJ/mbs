import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequestHeader, getResponseHeaders } from "@tanstack/react-start/server";
import ky, { isHTTPError } from "ky";
import { z } from "zod";

import { env } from "@/env";
import { SERVICE_UNAVAILABLE_MESSAGE, ServerApiError } from "@/lib/server-api-error";

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
                    // nginx puts the real client address here; Express uses it for rate limiting.
                    const forwardedFor = getRequestHeader("x-forwarded-for");

                    if (options.context.forwardCookie === false) {
                        request.headers.delete("cookie");
                    } else if (cookie) {
                        request.headers.set("cookie", cookie);
                    }

                    if (origin) {
                        request.headers.set("origin", origin);
                    }

                    if (forwardedFor) {
                        request.headers.set("x-forwarded-for", forwardedFor);
                    }
                },
            ],
            afterResponse: [
                ({ response }) => {
                    // One page request can make several API calls; append so an earlier call's cookies survive.
                    const responseHeaders = getResponseHeaders();

                    for (const setCookie of response.headers.getSetCookie()) {
                        responseHeaders.append("set-cookie", setCookie);
                    }
                },
            ],
            beforeError: [
                ({ error }) => {
                    if (isHTTPError(error)) {
                        const result = apiErrorSchema.safeParse(error.data);

                        const { status } = error.response;

                        // Only the message survives the trip to the browser, so server failures
                        // get one fixed message that the client can recognize as retryable.
                        if (status >= 500) {
                            return new ServerApiError(SERVICE_UNAVAILABLE_MESSAGE, status, error.data);
                        }

                        return new ServerApiError(
                            result.success ? result.data.message : "The request could not be completed.",
                            status,
                            error.data,
                        );
                    }

                    return new ServerApiError(SERVICE_UNAVAILABLE_MESSAGE, null, null);
                },
            ],
        },
    }),
);
