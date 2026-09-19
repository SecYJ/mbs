import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterContextProvider } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";

import { getContext } from "@/integrations/tanstack-query/RootProvider";

import { routeTree } from "../routeTree.gen";
import { renderInBrowser } from "./render-in-browser";

export const createTestRouterFromFiles = (initialLocation = "/") => {
    const router = createRouter({
        routeTree,
        history: createMemoryHistory({
            initialEntries: [initialLocation],
        }),
        context: getContext(),
    });

    return router;
};

type RenderWithFileRoutesOptions = {
    initialLocation?: string;
    routerContext?: ReturnType<typeof getContext>;
};

export const renderWithFileRoutes = async (
    ui: ReactNode,
    { initialLocation = "/", routerContext = getContext() }: RenderWithFileRoutesOptions = {},
) => {
    const router = createRouter({
        routeTree,
        history: createMemoryHistory({
            initialEntries: [initialLocation],
        }),
        context: routerContext,
    });

    const Wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={routerContext.queryClient}>
            <RouterContextProvider router={router}>{children}</RouterContextProvider>
        </QueryClientProvider>
    );

    const cleanup = await renderInBrowser(<Wrapper>{ui}</Wrapper>);

    return {
        cleanup,
        router,
    };
};

// Helper to test specific file routes
export const createMockFileRoute = (path: string, component: ComponentType) => {
    // This is useful for isolated testing when you don't want to use the full route tree
    return {
        path,
        component,
        // Add other common route properties as needed
    };
};
