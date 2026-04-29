import { createRouter as createTanStackRouter, parseSearchWith, stringifySearchWith } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { getContext } from "./integrations/tanstack-query/root-provider";

export function getRouter() {
    const context = getContext();

    const router = createTanStackRouter({
        routeTree,
        context,
        scrollRestoration: true,
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        parseSearch: parseSearchWith((value) => {
            const trimmed = value.trim();
            const looksLikeJson = trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.startsWith('"');
            if (!looksLikeJson) return value;
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }),
        stringifySearch: stringifySearchWith((value) => JSON.stringify(value)),
    });

    setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

    return router;
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>;
    }
}
