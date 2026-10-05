import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { signOutFn } from "@/features/auth/services/sign-out";
import { broadcastSessionSignOut } from "@/lib/session-broadcast";

export function useSignOut() {
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

    return {
        error: error ? (error instanceof Error ? error.message : "Unable to sign out.") : null,
        isPending,
        signOut,
    };
}
