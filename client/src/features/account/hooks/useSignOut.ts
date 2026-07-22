import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { signOutFn } from "@/features/auth/services/sign-out";
import { broadcastSessionSignOut } from "@/lib/session-broadcast";

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
            await signOutFn();
        },
        onSuccess: async (_data, _variables, _onMutateResult, context) => {
            broadcastSessionSignOut();
            context.client.clear();

            navigate({ to: "/login", replace: true });
        },
    });

    return { error: error ? signOutErrorMessage.parse(error) : null, isPending, signOut };
};
