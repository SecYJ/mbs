import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell, CheckCheck } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NOTIFICATION_FILTER_OPTIONS, type NotificationFilter } from "@/features/notifications/notification-filter";
import { formatNotificationDateTime } from "@/features/notifications/notification-format";
import {
    type NotificationNavigationItem,
    useNotificationNavigationMenu,
} from "@/features/notifications/hooks/use-notification-navigation-menu";
import { cn } from "@/lib/utils";

type NotificationMenuTriggerProps = {
    unreadBadgeLabel: string;
    unreadCount: number;
};

type NotificationMenuHeaderProps = {
    isMarkingAllRead: boolean;
    markAllAsRead: () => void;
    unreadCount: number;
};

type NotificationFilterControlsProps = {
    filter: NotificationFilter;
    setFilter: (filter: NotificationFilter) => void;
};

type NotificationPreviewListProps = {
    notifications: NotificationNavigationItem[];
    previewNotifications: NotificationNavigationItem[];
    selectNotification: (notification: NotificationNavigationItem) => void;
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
        markAllAsRead,
        notificationFilter,
        notifications,
        previewNotifications,
        selectNotification,
        setNotificationFilter,
        setOpen,
        unreadBadgeLabel,
        unreadCount,
    } = useNotificationNavigationMenu();

    return (
        <Popover open={isOpen} onOpenChange={setOpen}>
            <NotificationMenuTrigger unreadBadgeLabel={unreadBadgeLabel} unreadCount={unreadCount} />
            <PopoverContent
                align="end"
                sideOffset={10}
                className="w-[min(calc(100vw-2rem),23rem)] rounded-none border-(--hairline) bg-(--surface-01) p-0 text-(--bone) shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
            >
                <NotificationMenuHeader
                    isMarkingAllRead={isMarkingAllRead}
                    markAllAsRead={markAllAsRead}
                    unreadCount={unreadCount}
                />
                <NotificationFilterControls filter={notificationFilter} setFilter={setNotificationFilter} />
                <NotificationPreviewList
                    notifications={notifications}
                    previewNotifications={previewNotifications}
                    selectNotification={selectNotification}
                />
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

const NotificationMarkAllButton = ({ isMarkingAllRead, markAllAsRead, unreadCount }: NotificationMenuHeaderProps) => (
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

const NotificationMenuHeader = ({ isMarkingAllRead, markAllAsRead, unreadCount }: NotificationMenuHeaderProps) => (
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
            <NotificationMarkAllButton
                isMarkingAllRead={isMarkingAllRead}
                markAllAsRead={markAllAsRead}
                unreadCount={unreadCount}
            />
        </div>
    </div>
);

const NotificationFilterControls = ({ filter, setFilter }: NotificationFilterControlsProps) => (
    <div className="flex gap-1 border-b border-(--hairline) p-2">
        {NOTIFICATION_FILTER_OPTIONS.map((option) => (
            <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
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

const NotificationEmptyPreview = ({ notifications }: Pick<NotificationPreviewListProps, "notifications">) => (
    <div className="px-4 py-7 text-center">
        <Bell className="mx-auto size-5 text-(--bone-dim)" strokeWidth={1.4} />
        <p className="mt-3 text-sm font-semibold text-(--bone)">
            {notifications.length === 0 ? "No notifications yet" : "No unread notifications"}
        </p>
        <p className="mt-1 text-xs leading-5 text-(--bone-muted)">
            {notifications.length === 0 ? "Booking updates will collect here." : "Everything has been read."}
        </p>
    </div>
);

const NotificationPreviewList = ({
    notifications,
    previewNotifications,
    selectNotification,
}: NotificationPreviewListProps) => {
    if (previewNotifications.length === 0) {
        return <NotificationEmptyPreview notifications={notifications} />;
    }

    return (
        <div className="divide-y divide-(--hairline)">
            {previewNotifications.map((notification) => (
                <Link
                    key={notification.id}
                    to="/bookings/$bookingId"
                    params={{ bookingId: notification.bookingId }}
                    onClick={() => selectNotification(notification)}
                    className="block w-full cursor-pointer px-4 py-3 text-left no-underline transition-colors hover:bg-(--surface-02)"
                    aria-label={
                        notification.status === "unread" ? "Open booking and mark notification as read" : "Open booking"
                    }
                >
                    <div className="flex items-start gap-3">
                        <span
                            className={cn(
                                "mt-1 size-1.5 shrink-0 rounded-full",
                                notification.status === "unread" ? "bg-(--signal)" : "bg-(--bone-faint)",
                            )}
                        />
                        <div className="min-w-0">
                            <p className="line-clamp-2 text-sm leading-5 text-(--bone)">{notification.message}</p>
                            <p className="mt-1 truncate text-xs text-(--bone-muted)">{notification.booking.title}</p>
                            <p className="mt-1 text-[0.66rem] text-(--bone-dim)">
                                {formatNotificationDateTime(notification.createdAt)}
                            </p>
                        </div>
                    </div>
                </Link>
            ))}
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
