import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { broadcastSessionSignOut } from "@/lib/session-broadcast";
import { z } from "zod";

const signOutErrorMessage = z
    .instanceof(Error)
    .transform((v) => v.message)
    .catch("Unable to sign out.");

export const useSignOut = () => {
    const navigate = useNavigate();

    const {
        mutate: signOut,
        error,
        isPending,
    } = useMutation({
        mutationFn: async () => {
            const { error: signOutError } = await authClient.signOut();

            if (signOutError) {
                throw new Error(signOutError.message ?? "Unable to sign out.");
            }
        },
        onSuccess: async (_data, _variables, _onMutateResult, context) => {
            broadcastSessionSignOut();
            context.client.clear();

            navigate({ to: "/login", replace: true });
        },
    });

    return { error: error ? signOutErrorMessage.parse(error) : null, isPending, signOut };
};
