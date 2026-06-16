import { scan } from "react-scan";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";

import { useEffect, type ReactNode } from "react";
import type { QueryClient } from "@tanstack/react-query";

import appCss from "@/styles.css?url";
import { NotFound } from "@/components/NotFound";
import { PersistentClientStoreHydrator } from "@/stores/PersistentClientStoreHydrator";

type MyRouterContext = {
    queryClient: QueryClient;
};

const RootDocument = ({ children }: { children: ReactNode }) => {
    useEffect(() => {
        scan({
            trackUnnecessaryRenders: true,
        });
    }, []);

    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body className="font-sans antialiased wrap-anywhere selection:bg-[rgba(79,184,178,0.24)]">
                <PersistentClientStoreHydrator />
                {children}
                <ReactQueryDevtools buttonPosition="bottom-left" />
                <Scripts />
            </body>
        </html>
    );
};

// react-doctor-disable-next-line react-doctor/only-export-components -- TanStack file routes must export Route.
export const Route = createRootRouteWithContext<MyRouterContext>()({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "TanStack Start Starter",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
        ],
    }),
    shellComponent: RootDocument,
    notFoundComponent: NotFound,
});
