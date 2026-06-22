import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";
import { subscribeToSessionSignOut } from "@/lib/session-broadcast";

export const useCrossTabSignOutSync = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const signOutAndRedirect = async () => {
            queryClient.clear();

            try {
                await authClient.signOut();
            } finally {
                navigate({ to: "/login", replace: true });
            }
        };

        return subscribeToSessionSignOut(() => {
            void signOutAndRedirect();
        });
    }, []);
};
