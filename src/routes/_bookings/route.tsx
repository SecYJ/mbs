import {
    createFileRoute,
    Link,
    linkOptions,
    Outlet,
    stripSearchParams,
    useRouter,
    useRouterState,
} from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { AppPending } from "@/components/app-pending";
import { AuthenticatedAccountMenu } from "@/features/account/components/authenticated-account-menu";
import { NotificationNavigationMenu } from "@/features/notifications/components/notification-navigation-menu";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";
import { requireAuthenticatedUser } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";

const PENDING_OVERLAY_MIN_MS = 700;

const BOOKING_SEARCH_DEFAULTS = {
    attendeeSearch: "",
    filter: "unread",
} as const;

const bookingsSearchSchema = z.object({
    attendeeSearch: z
        .string()
        .catch(BOOKING_SEARCH_DEFAULTS.attendeeSearch)
        .prefault(BOOKING_SEARCH_DEFAULTS.attendeeSearch),
    filter: z.enum(["unread", "all"]).catch(BOOKING_SEARCH_DEFAULTS.filter).prefault(BOOKING_SEARCH_DEFAULTS.filter),
});

export const Route = createFileRoute("/_bookings")({
    validateSearch: bookingsSearchSchema,
    search: {
        middlewares: [stripSearchParams(BOOKING_SEARCH_DEFAULTS)],
    },
    beforeLoad: async () => ({ session: await requireAuthenticatedUser() }),
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(notificationsQueryOptions());

        return context.session;
    },
    component: AppLayout,
});

const navItems = linkOptions([
    { to: "/bookings", label: "Bookings" },
    { to: "/my-bookings", label: "My Bookings" },
]);

const BookingRoutePendingOverlay = () => {
    const router = useRouter();
    const isRouterPending = useRouterState({
        select: (state) => state.status === "pending" || state.matches.some((match) => match.status === "pending"),
    });
    const [isNavigationVisible, setIsNavigationVisible] = useState(false);

    useEffect(() => {
        let hideTimer: number | undefined;

        const showNavigationPending = () => {
            if (hideTimer) window.clearTimeout(hideTimer);
            setIsNavigationVisible(true);
        };

        const hideNavigationPending = () => {
            if (hideTimer) window.clearTimeout(hideTimer);
            hideTimer = window.setTimeout(() => setIsNavigationVisible(false), PENDING_OVERLAY_MIN_MS);
        };

        const unsubscribeBeforeNavigate = router.subscribe("onBeforeNavigate", showNavigationPending);
        const unsubscribeResolved = router.subscribe("onResolved", hideNavigationPending);

        return () => {
            unsubscribeBeforeNavigate();
            unsubscribeResolved();
            if (hideTimer) window.clearTimeout(hideTimer);
        };
    }, [router]);

    if (!isRouterPending && !isNavigationVisible) return null;

    return <AppPending />;
};

function AppLayout() {
    const { user } = Route.useLoaderData();
    const year = new Date().getFullYear();

    return (
        <div className="relative min-h-dvh bg-[#050505] text-(--bone)">
            <BookingRoutePendingOverlay />
            {/* Film grain overlay */}
            <svg aria-hidden className="pointer-events-none fixed inset-0 z-50 size-full opacity-[0.016]">
                <filter id="grain-app">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain-app)" />
            </svg>

            {/* Navigation — hairline editorial bar */}
            <nav className="sticky top-0 z-40 border-b border-(--hairline) bg-[#050505]/90 backdrop-blur-xl">
                <div className="flex h-16 items-center justify-between px-6 lg:px-10 2xl:px-14">
                    {/* Left: Monogram + Nav */}
                    <div className="flex items-center gap-12">
                        <Link to="/bookings" className="flex items-center gap-3 no-underline">
                            <div className="inline-flex size-8 items-center justify-center border border-(--gold)">
                                <span className="display-italic text-[0.95rem] leading-none text-(--gold)">M</span>
                            </div>
                            <div className="hidden flex-col leading-tight sm:flex">
                                <span className="text-[0.7rem] font-semibold tracking-[0.24em] uppercase text-(--bone)">
                                    Meridian
                                </span>
                                <span className="eyebrow mt-0.5">Est. {year}</span>
                            </div>
                        </Link>

                        <div className="hidden items-center gap-8 sm:flex">
                            {navItems.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="group relative py-5 text-[0.68rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase no-underline transition-colors hover:text-(--bone-muted) data-[status=active]:text-(--bone)"
                                >
                                    {item.label}
                                    <span className="absolute bottom-0 right-0 left-0 h-px bg-transparent transition-all duration-300 group-data-[status=active]:bg-(--gold)" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right: Admin shortcut + Notifications + Avatar */}
                    <div className="flex items-center gap-2">
                        {isAdminRole(user.role) ? (
                            <Link
                                to="/admin/rooms"
                                aria-label="Admin dashboard"
                                title="Admin dashboard"
                                className="flex size-9 items-center justify-center border border-transparent text-(--bone-dim) no-underline transition-all duration-200 hover:border-(--hairline) hover:text-(--gold)"
                            >
                                <Shield className="size-4" strokeWidth={1.4} />
                            </Link>
                        ) : null}

                        <NotificationNavigationMenu />

                        <AuthenticatedAccountMenu user={user} />
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="px-6 py-6 lg:px-10 lg:py-7 2xl:px-14">
                <Outlet />
            </main>
        </div>
    );
}
