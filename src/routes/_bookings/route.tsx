import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, linkOptions, Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowRight, Bell, CheckCheck, LogOut, Settings, Shield } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    filterNotifications,
    type NotificationFilter,
    notificationFilterDefaults,
    notificationFilterOptions,
} from "@/features/notifications/notification-filter";
import { formatNotificationDateTime } from "@/features/notifications/notification-format";
import { useNotificationReadActions } from "@/features/notifications/hooks/use-notification-read-actions";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";
import { playNotificationSound } from "@/features/settings/notification-sound";
import { useUserPreferences } from "@/features/settings/user-preferences";
import { authClient } from "@/lib/auth-client";
import { requireAuthenticatedUser } from "@/lib/session";

const navItems = linkOptions([
    { to: "/bookings", label: "Bookings" },
    { to: "/my-bookings", label: "My Bookings" },
    { to: "/history", label: "History" },
]);

const getInitials = (name: string) =>
    name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?";

const AppLayout = () => {
    const { user } = Route.useLoaderData();
    const { data: notifications = [], isFetched: hasFetchedNotifications } = useQuery(notificationsQueryOptions());
    const { markAsRead, markAllAsRead, isMarkingAllRead } = useNotificationReadActions();
    const { preferences } = useUserPreferences();
    const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>("all");
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const previousUnreadIdsRef = useRef<Set<string> | null>(null);
    const year = new Date().getFullYear();
    const navigate = useNavigate();
    const router = useRouter();
    const queryClient = useQueryClient();
    const unreadCount = notifications.filter((notification) => notification.status === "unread").length;
    const unreadBadgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);
    const filteredNotifications = filterNotifications(notifications, notificationFilter);
    const previewNotifications = filteredNotifications.slice(0, 4);

    useEffect(() => {
        if (!hasFetchedNotifications) return;

        const unreadIds = new Set(
            notifications
                .filter((notification) => notification.status === "unread")
                .map((notification) => notification.id),
        );

        if (!previousUnreadIdsRef.current) {
            previousUnreadIdsRef.current = unreadIds;
            return;
        }

        const hasNewUnreadNotification = [...unreadIds].some((notificationId) =>
            !previousUnreadIdsRef.current?.has(notificationId),
        );

        if (hasNewUnreadNotification && preferences.notifications.soundEnabled) {
            void playNotificationSound();
        }

        previousUnreadIdsRef.current = unreadIds;
    }, [hasFetchedNotifications, notifications, preferences.notifications.soundEnabled]);

    const handleNotificationOpenChange = (open: boolean) => {
        setNotificationOpen(open);
        if (open) setNotificationFilter(notificationFilterDefaults.filter);
    };

    const handleSignOut = async () => {
        await authClient.signOut();
        queryClient.clear();
        await router.invalidate();
        navigate({ to: "/login" });
    };

    return (
        <div className="relative min-h-dvh bg-black text-(--bone)">
            {/* Film grain overlay */}
            <svg aria-hidden className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.016]">
                <filter id="grain-app">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain-app)" />
            </svg>

            {/* Navigation — hairline editorial bar */}
            <nav className="sticky top-0 z-40 border-b border-(--hairline) bg-black/90 backdrop-blur-xl">
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
                        {user.role === "admin" ? (
                            <Link
                                to="/admin/rooms"
                                aria-label="Admin dashboard"
                                title="Admin dashboard"
                                className="flex size-9 items-center justify-center border border-transparent text-(--bone-dim) no-underline transition-all duration-200 hover:border-(--hairline) hover:text-(--gold)"
                            >
                                <Shield className="size-4" strokeWidth={1.4} />
                            </Link>
                        ) : null}

                        <Popover open={notificationOpen} onOpenChange={handleNotificationOpenChange}>
                            <PopoverTrigger
                                aria-label={
                                    unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"
                                }
                                className="relative flex size-9 cursor-pointer items-center justify-center border border-transparent text-(--bone-dim) transition-all duration-200 hover:border-(--hairline) hover:text-(--bone) data-[popup-open]:border-(--hairline) data-[popup-open]:text-(--bone)"
                            >
                                <Bell className="size-4" strokeWidth={1.4} />
                                {unreadCount > 0 ? (
                                    <span
                                        className="absolute -top-1 -right-1 min-w-4 rounded-full border border-black bg-(--signal) px-1 text-center text-[0.55rem] leading-4 font-bold text-black"
                                        style={{ animation: "signal-pulse 2.4s ease-in-out infinite" }}
                                    >
                                        {unreadBadgeLabel}
                                    </span>
                                ) : null}
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                sideOffset={10}
                                className="w-[min(calc(100vw-2rem),23rem)] rounded-none border-(--hairline) bg-(--surface-01) p-0 text-(--bone) shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
                            >
                                <div className="flex items-center justify-between border-b border-(--hairline) px-4 py-3">
                                    <div>
                                        <p className="text-[0.74rem] font-semibold tracking-[0.22em] uppercase text-(--bone)">
                                            Notifications
                                        </p>
                                        <p className="mt-1 text-[0.66rem] text-(--bone-muted)">
                                            {unreadCount > 0
                                                ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                                                : "No unread updates"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {unreadCount > 0 ? (
                                            <span className="min-w-5 rounded-full bg-(--signal) px-1.5 py-0.5 text-center text-[0.62rem] font-bold text-black">
                                                {unreadCount}
                                            </span>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={markAllAsRead}
                                            disabled={unreadCount === 0 || isMarkingAllRead}
                                            className="inline-flex size-8 cursor-pointer items-center justify-center border border-(--hairline) text-(--bone-dim) transition-colors hover:border-(--hairline-strong) hover:text-(--bone) disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label="Mark all notifications as read"
                                            title="Mark all as read"
                                        >
                                            <CheckCheck className="size-4" strokeWidth={1.4} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-1 border-b border-(--hairline) p-2">
                                    {notificationFilterOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setNotificationFilter(option.value)}
                                            className={
                                                notificationFilter === option.value
                                                    ? "flex-1 cursor-pointer border border-(--hairline-strong) bg-(--surface-02) px-3 py-2 text-[0.62rem] font-semibold tracking-[0.22em] text-(--bone) uppercase"
                                                    : "flex-1 cursor-pointer border border-transparent px-3 py-2 text-[0.62rem] font-semibold tracking-[0.22em] text-(--bone-dim) uppercase transition-colors hover:border-(--hairline) hover:text-(--bone)"
                                            }
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>

                                {previewNotifications.length === 0 ? (
                                    <div className="px-4 py-7 text-center">
                                        <Bell className="mx-auto size-5 text-(--bone-dim)" strokeWidth={1.4} />
                                        <p className="mt-3 text-sm font-semibold text-(--bone)">
                                            {notifications.length === 0
                                                ? "No notifications yet"
                                                : "No unread notifications"}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-(--bone-muted)">
                                            {notifications.length === 0
                                                ? "Booking updates will collect here."
                                                : "Everything has been read."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-(--hairline)">
                                        {previewNotifications.map((notification) => (
                                            <Link
                                                key={notification.id}
                                                to="/bookings/$bookingId"
                                                params={{ bookingId: notification.bookingId }}
                                                onClick={() => {
                                                    if (notification.status === "unread") markAsRead(notification.id);
                                                    setNotificationOpen(false);
                                                }}
                                                className="block w-full cursor-pointer px-4 py-3 text-left no-underline transition-colors hover:bg-(--surface-02)"
                                                aria-label={
                                                    notification.status === "unread"
                                                        ? "Open booking and mark notification as read"
                                                        : "Open booking"
                                                }
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span
                                                        className={
                                                            notification.status === "unread"
                                                                ? "mt-1 size-1.5 shrink-0 rounded-full bg-(--signal)"
                                                                : "mt-1 size-1.5 shrink-0 rounded-full bg-(--bone-faint)"
                                                        }
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="line-clamp-2 text-sm leading-5 text-(--bone)">
                                                            {notification.message}
                                                        </p>
                                                        <p className="mt-1 truncate text-xs text-(--bone-muted)">
                                                            {notification.booking.title}
                                                        </p>
                                                        <p className="mt-1 text-[0.66rem] text-(--bone-dim)">
                                                            {formatNotificationDateTime(notification.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                <div className="border-t border-(--hairline) p-2">
                                    <Link
                                        to="/notifications"
                                        search={{ filter: notificationFilter }}
                                        onClick={() => setNotificationOpen(false)}
                                        className="flex w-full items-center justify-between px-3 py-2.5 text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase no-underline transition-colors hover:bg-(--surface-02) hover:text-(--bone)"
                                    >
                                        <span>View all notifications</span>
                                        <ArrowRight className="size-4" strokeWidth={1.4} />
                                    </Link>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Popover open={accountOpen} onOpenChange={setAccountOpen}>
                            <PopoverTrigger
                                aria-label="Account"
                                className="flex size-9 cursor-pointer items-center justify-center border border-(--hairline) bg-(--surface-01) text-[0.7rem] font-semibold tracking-widest text-(--bone) transition-all duration-200 hover:border-(--hairline-strong) hover:bg-(--surface-02) data-[popup-open]:border-(--hairline-strong) data-[popup-open]:bg-(--surface-02)"
                            >
                                {getInitials(user.name)}
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                sideOffset={10}
                                className="w-56 rounded-none border-(--hairline) bg-(--surface-01) p-1 text-(--bone) shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
                            >
                                <div className="border-b border-(--hairline) px-3 py-2.5">
                                    <p className="truncate text-[0.78rem] font-semibold text-(--bone)">{user.name}</p>
                                    <p className="truncate text-[0.66rem] text-(--bone-muted)">{user.email}</p>
                                </div>
                                <Link
                                    to="/settings"
                                    onClick={() => setAccountOpen(false)}
                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase no-underline transition-colors hover:bg-(--surface-02) hover:text-(--bone)"
                                >
                                    <Settings className="size-4" strokeWidth={1.4} />
                                    <span>Settings</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase transition-colors hover:bg-(--surface-02) hover:text-(--bone)"
                                >
                                    <LogOut className="size-4" strokeWidth={1.4} />
                                    <span>Sign Out</span>
                                </button>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="px-6 py-6 lg:px-10 lg:py-7 2xl:px-14">
                <Outlet />
            </main>
        </div>
    );
};

export const Route = createFileRoute("/_bookings")({
    beforeLoad: async () => ({ session: await requireAuthenticatedUser() }),
    loader: ({ context }) => context.session,
    component: AppLayout,
});
