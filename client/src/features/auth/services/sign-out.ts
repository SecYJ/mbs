import { createServerFn } from "@tanstack/react-start";

import { getServerApiClient } from "@/lib/server-api-client";

type SignOutResponse = {
    success: boolean;
};

export const signOutFn = createServerFn({ method: "POST" }).handler(async () => {
    return getServerApiClient().post("auth/sign-out").json<SignOutResponse>();
});
