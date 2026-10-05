import { QueryClient } from "@tanstack/react-query";

import { shouldRetryQuery } from "@/lib/query-retry";

const QUERY_STALE_TIME_MS = 30_000;

export const getContext = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                // Keeps queries hydrated from SSR from refetching immediately on mount.
                staleTime: QUERY_STALE_TIME_MS,
                retry: shouldRetryQuery,
            },
        },
    });

    return {
        queryClient,
    };
};
