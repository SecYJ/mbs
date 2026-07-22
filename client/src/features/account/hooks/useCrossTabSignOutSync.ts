import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { subscribeToSessionSignOut } from "@/lib/session-broadcast";

export const useCrossTabSignOutSync = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const clearSessionAndRedirect = () => {
            queryClient.clear();
            navigate({ to: "/login", replace: true });
        };

        return subscribeToSessionSignOut(clearSessionAndRedirect);
    }, []);
};
