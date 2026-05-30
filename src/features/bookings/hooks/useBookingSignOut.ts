import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const useBookingSignOut = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const router = useRouter();

    const signOut = async () => {
        await authClient.signOut();
        queryClient.clear();
        await router.invalidate();
        // react-doctor-disable-next-line react-doctor/tanstack-start-no-navigate-in-render -- Sign-out navigation runs inside an async click handler.
        navigate({ to: "/login" });
    };

    return signOut;
};
