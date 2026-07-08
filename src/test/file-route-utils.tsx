import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterContextProvider } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";
import { getContext } from "@/integrations/tanstack-query/RootProvider";
import { render, type RenderOptions } from "@testing-library/react";
import type { ComponentType, ReactElement, ReactNode } from "react";

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

type RenderWithFileRoutesOptions = Omit<RenderOptions, "wrapper"> & {
    initialLocation?: string;
    routerContext?: ReturnType<typeof getContext>;
};

export const renderWithFileRoutes = (
    ui: ReactElement,
    { initialLocation = "/", routerContext = getContext(), ...renderOptions }: RenderWithFileRoutesOptions = {},
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

    return {
        ...render(ui, { wrapper: Wrapper, ...renderOptions }),
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
