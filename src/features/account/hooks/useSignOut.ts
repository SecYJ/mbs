import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

const getSignOutErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return "Unable to sign out.";
};

export const useSignOut = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const router = useRouter();

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
        onSuccess: async () => {
            queryClient.clear();
            await router.invalidate();

            navigate({ to: "/login" });
        },
    });

    return { error: error ? getSignOutErrorMessage(error) : null, isPending, signOut };
};
