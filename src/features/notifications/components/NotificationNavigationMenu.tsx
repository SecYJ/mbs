import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell, CheckCheck } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotificationNavigationMenu } from "@/features/notifications/hooks/useNotificationNavigationMenu";
import { type NotificationFilter } from "@/features/notifications/schemas/notificationSchema";
import { formatNotificationDateTime } from "@/features/notifications/utils/notificationFormat";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { NOTIFICATION_FILTER_OPTIONS } from "@/features/notifications/constants/notificationConstants";
import type { NotificationItem } from "@/features/notifications/services/queries";

type NotificationMenuTriggerProps = {
    unreadBadgeLabel: string;
    unreadCount: number;
};

type NotificationMenuHeaderProps = {
    children: ReactNode;
    unreadCount: number;
};

type NotificationMarkAllButtonProps = {
    isMarkingAllRead: boolean;
    markAllAsRead: () => void;
    unreadCount: number;
};

type NotificationFilterControlsProps = {
    filter: NotificationFilter;
    prefetchNotifications: (filter: NotificationFilter) => void;
    setFilter: (filter: NotificationFilter) => void;
};

type NotificationPreviewListProps = {
    totalCount: number;
    previewNotifications: NotificationItem[];
    selectNotification: (notification: NotificationItem) => void;
};

type NotificationCenterLinkProps = {
    closeMenu: () => void;
    filter: NotificationFilter;
};

export const NotificationNavigationMenu = () => {
    const {
        closeMenu,
        isMarkingAllRead,
        isOpen,
        isPending,
        markAllAsRead,
        notificationFilter,
        prefetchNotifications,
        previewNotifications,
        selectNotification,
        setNotificationFilter,
        setVisibleFilter,
        totalCount,
        unreadBadgeLabel,
        unreadCount,
    } = useNotificationNavigationMenu();

    return (
        <Popover open={isOpen} onOpenChange={(open) => setVisibleFilter(open ? "all" : null)}>
            <NotificationMenuTrigger unreadBadgeLabel={unreadBadgeLabel} unreadCount={unreadCount} />
            <PopoverContent
                align="end"
                sideOffset={10}
                className="w-[min(calc(100vw-2rem),23rem)] rounded-none border-(--hairline) bg-(--surface-01) p-0 text-(--bone) shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
            >
                <NotificationMenuHeader unreadCount={unreadCount}>
                    <NotificationMarkAllButton
                        isMarkingAllRead={isMarkingAllRead}
                        markAllAsRead={markAllAsRead}
                        unreadCount={unreadCount}
                    />
                </NotificationMenuHeader>

                {totalCount > 0 ? (
                    <NotificationFilterControls
                        filter={notificationFilter}
                        prefetchNotifications={prefetchNotifications}
                        setFilter={setNotificationFilter}
                    />
                ) : null}

                {isPending ? (
                    <NotificationPreviewListSkeleton />
                ) : (
                    <NotificationPreviewList
                        totalCount={totalCount}
                        previewNotifications={previewNotifications}
                        selectNotification={selectNotification}
                    />
                )}

                <NotificationCenterLink closeMenu={closeMenu} filter={notificationFilter} />
            </PopoverContent>
        </Popover>
    );
};

const NotificationMenuTrigger = ({ unreadBadgeLabel, unreadCount }: NotificationMenuTriggerProps) => (
    <PopoverTrigger
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        className="relative flex size-9 cursor-pointer items-center justify-center border border-transparent text-(--bone-dim) transition-all duration-200 hover:border-(--hairline) hover:text-(--bone) data-popup-open:border-(--hairline) data-popup-open:text-(--bone)"
    >
        <Bell className="size-4" strokeWidth={1.4} />
        {unreadCount > 0 ? (
            <span
                className="absolute -top-1 -right-1 min-w-4 rounded-full border border-black bg-(--signal) px-1 text-center text-[0.55rem] leading-4 font-bold text-black"
                style={{ animation: "signal-pulse 900ms ease-in-out infinite" }}
            >
                {unreadBadgeLabel}
            </span>
        ) : null}
    </PopoverTrigger>
);

const NotificationMarkAllButton = ({
    isMarkingAllRead,
    markAllAsRead,
    unreadCount,
}: NotificationMarkAllButtonProps) => (
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
);

const NotificationMenuHeader = ({ children, unreadCount }: NotificationMenuHeaderProps) => (
    <div className="flex items-center justify-between border-b border-(--hairline) px-4 py-3">
        <div>
            <p className="text-[0.74rem] font-semibold tracking-[0.22em] uppercase text-(--bone)">Notifications</p>
            <p className="mt-1 text-[0.66rem] text-(--bone-muted)">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "No unread updates"}
            </p>
        </div>
        <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
                <span className="min-w-5 rounded-full bg-(--signal) px-1.5 py-0.5 text-center text-[0.62rem] font-bold text-black">
                    {unreadCount}
                </span>
            ) : null}

            {children}
        </div>
    </div>
);

const NotificationFilterControls = ({ filter, prefetchNotifications, setFilter }: NotificationFilterControlsProps) => (
    <div className="flex gap-1 border-b border-(--hairline) p-2">
        {NOTIFICATION_FILTER_OPTIONS.map((option) => (
            <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                onMouseEnter={() => prefetchNotifications(option.value)}
                aria-pressed={filter === option.value}
                className={cn(
                    "flex-1 cursor-pointer border px-3 py-2 text-[0.62rem] font-semibold tracking-[0.22em] uppercase",
                    filter === option.value
                        ? "border-(--hairline-strong) bg-(--surface-02) text-(--bone)"
                        : "border-transparent text-(--bone-dim) transition-colors hover:border-(--hairline) hover:text-(--bone)",
                )}
            >
                {option.label}
            </button>
        ))}
    </div>
);

const NotificationPreviewListSkeleton = () => (
    <div aria-busy="true" aria-label="Loading notifications" className="divide-y divide-(--hairline)">
        {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-1 size-1.5 shrink-0 animate-pulse rounded-full bg-(--bone-faint)" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-4/5 animate-pulse bg-(--surface-03)" />
                    <div className="h-2.5 w-2/5 animate-pulse bg-(--surface-03)" />
                    <div className="h-2.5 w-1/4 animate-pulse bg-(--surface-03)" />
                </div>
            </div>
        ))}
    </div>
);

const NotificationPreviewList = ({
    totalCount,
    previewNotifications,
    selectNotification,
}: NotificationPreviewListProps) => {
    if (previewNotifications.length === 0) {
        return (
            <div className="px-4 py-7 text-center">
                <Bell className="mx-auto size-5 text-(--bone-dim)" strokeWidth={1.4} />
                <p className="mt-3 text-sm font-semibold text-(--bone)">
                    {totalCount === 0 ? "No notifications yet" : "No unread notifications"}
                </p>
                <p className="mt-1 text-xs leading-5 text-(--bone-muted)">
                    {totalCount === 0 ? "Booking updates will collect here." : "Everything has been read."}
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-(--hairline)">
            {previewNotifications.map((notification) => {
                const notificationContent = (
                    <div className="flex items-start gap-3">
                        <span
                            className={cn(
                                "mt-1 size-1.5 shrink-0 rounded-full",
                                notification.status === "unread" ? "bg-(--signal)" : "bg-(--bone-faint)",
                            )}
                        />
                        <div className="min-w-0">
                            <p className="line-clamp-2 text-sm leading-5 text-(--bone)">{notification.message}</p>
                            <p className="mt-1 truncate text-xs text-(--bone-muted)">
                                {notification.booking?.title ?? "System notification"}
                            </p>
                            <p className="mt-1 text-[0.66rem] text-(--bone-dim)">
                                {formatNotificationDateTime(notification.createdAt)}
                            </p>
                        </div>
                    </div>
                );

                return notification.bookingId ? (
                    <Link
                        key={notification.id}
                        to="/bookings/$bookingId"
                        params={{ bookingId: notification.bookingId }}
                        onClick={() => selectNotification(notification)}
                        className="block w-full cursor-pointer px-4 py-3 text-left no-underline transition-colors hover:bg-(--surface-02)"
                        aria-label={
                            notification.status === "unread"
                                ? "Open booking and mark notification as read"
                                : "Open booking"
                        }
                    >
                        {notificationContent}
                    </Link>
                ) : (
                    <button
                        key={notification.id}
                        type="button"
                        onClick={() => selectNotification(notification)}
                        className="block w-full cursor-pointer px-4 py-3 text-left transition-colors hover:bg-(--surface-02)"
                        aria-label={
                            notification.status === "unread" ? "Mark notification as read" : "Read notification"
                        }
                    >
                        {notificationContent}
                    </button>
                );
            })}
        </div>
    );
};

const NotificationCenterLink = ({ closeMenu, filter }: NotificationCenterLinkProps) => (
    <div className="border-t border-(--hairline) p-2">
        <Link
            to="/notifications"
            search={{ filter }}
            onClick={closeMenu}
            className="flex w-full items-center justify-between px-3 py-2.5 text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase no-underline transition-colors hover:bg-(--surface-02) hover:text-(--bone)"
        >
            <span>View all notifications</span>
            <ArrowRight className="size-4" strokeWidth={1.4} />
        </Link>
    </div>
);
