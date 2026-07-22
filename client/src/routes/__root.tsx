import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { type ReactNode } from "react";

import { DefaultError } from "@/components/DefaultError";
import { NotFound } from "@/components/NotFound";
import { PersistentClientStoreHydrator } from "@/stores/PersistentClientStoreHydrator";

import appCss from "@/styles.css?url";

type MyRouterContext = {
    queryClient: QueryClient;
};

const RootDocument = ({ children }: { children: ReactNode }) => {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body className="font-sans wrap-anywhere antialiased selection:bg-[rgba(79,184,178,0.24)]">
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
                title: "Meridian",
            },
        ],
        links: [
            {
                rel: "preconnect",
                href: "https://fonts.googleapis.com",
            },
            {
                rel: "preconnect",
                href: "https://fonts.gstatic.com",
                crossOrigin: "anonymous",
            },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,700&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap",
            },
            {
                rel: "stylesheet",
                href: appCss,
            },
        ],
    }),
    shellComponent: RootDocument,
    notFoundComponent: NotFound,
    errorComponent: DefaultError,
});
