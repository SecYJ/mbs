import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { Bell, CalendarDays, CheckCheck, CheckCircle2 } from "lucide-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import {
    filterNotifications,
    notificationFilterDefaults,
    notificationFilterOptions,
} from "@/features/notifications/notification-filter";
import {
    formatNotificationDate,
    formatNotificationDateTime,
    formatNotificationTime,
} from "@/features/notifications/notification-format";
import { useNotificationReadActions } from "@/features/notifications/hooks/use-notification-read-actions";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";

const statusLabel = {
    pending: "Pending",
    read: "Read",
    unread: "Unread",
};

const notificationSearchSchema = z.object({
    filter: z
        .enum(["all", "unread"])
        .default(notificationFilterDefaults.filter)
        .catch(notificationFilterDefaults.filter),
});

const NotificationsPage = () => {
    const { data: notifications } = useSuspenseQuery(notificationsQueryOptions());
    const { markAsRead, markAllAsRead, isMarkingRead, isMarkingAllRead } = useNotificationReadActions();
    const { filter } = Route.useSearch();
    const unreadCount = notifications.filter((notification) => notification.status === "unread").length;
    const filteredNotifications = filterNotifications(notifications, filter);

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            <header className="flex flex-col gap-5 border-b border-(--hairline) pb-7 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="eyebrow eyebrow-gold">NOTIFICATIONS</p>
                    <h1 className="display-serif mt-3 text-4xl leading-none text-(--bone) md:text-5xl">
                        Notification Center
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-(--bone-muted)">
                        Booking activity for meetings you organize or attend.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0 || isMarkingAllRead}
                        className="inline-flex min-h-14 cursor-pointer items-center gap-2 border border-(--hairline) px-4 text-[0.66rem] font-semibold tracking-[0.22em] text-(--bone-dim) uppercase transition-colors hover:border-(--hairline-strong) hover:text-(--bone) disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <CheckCheck className="size-4" strokeWidth={1.4} />
                        <span>Mark all</span>
                    </button>
                    <div className="min-w-20 border border-(--hairline) px-4 py-3 text-center">
                        <p className="eyebrow">TOTAL</p>
                        <p className="mt-1 text-xl font-semibold text-(--bone)">{notifications.length}</p>
                    </div>
                    <div className="min-w-20 border border-(--hairline) px-4 py-3 text-center">
                        <p className="eyebrow">UNREAD</p>
                        <p className="mt-1 text-xl font-semibold text-(--signal)">{unreadCount}</p>
                    </div>
                </div>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex border border-(--hairline) p-1">
                    {notificationFilterOptions.map((option) => (
                        <Link
                            key={option.value}
                            to="/notifications"
                            search={{ filter: option.value }}
                            className={
                                filter === option.value
                                    ? "border border-(--hairline-strong) bg-(--surface-02) px-4 py-2 text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone) uppercase no-underline"
                                    : "border border-transparent px-4 py-2 text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase no-underline transition-colors hover:border-(--hairline) hover:text-(--bone)"
                            }
                        >
                            {option.label}
                        </Link>
                    ))}
                </div>
                <p className="text-xs text-(--bone-dim)">
                    Showing {filteredNotifications.length} of {notifications.length}
                </p>
            </div>

            {filteredNotifications.length === 0 ? (
                <section className="flex min-h-80 flex-col items-center justify-center border border-dashed border-(--hairline) px-6 text-center">
                    <Bell className="size-8 text-(--bone-dim)" strokeWidth={1.4} />
                    <h2 className="mt-5 text-lg font-semibold text-(--bone)">
                        {notifications.length === 0 ? "No notifications yet" : "No unread notifications"}
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-(--bone-muted)">
                        {notifications.length === 0
                            ? "Updates for bookings you participate in will appear here."
                            : "Everything in your notification center has been read."}
                    </p>
                </section>
            ) : (
                <section className="divide-y divide-(--hairline) border-y border-(--hairline)">
                    {filteredNotifications.map((notification) => (
                        <article
                            key={notification.id}
                            className="grid gap-4 px-1 py-5 md:grid-cols-[1fr_auto] md:items-center"
                        >
                            <Link
                                to="/bookings/$bookingId"
                                params={{ bookingId: notification.bookingId }}
                                onClick={() => {
                                    if (notification.status === "unread") markAsRead(notification.id);
                                }}
                                className="flex gap-4 text-(--bone) no-underline transition-colors hover:text-(--gold)"
                            >
                                <div className="mt-1 flex size-10 shrink-0 items-center justify-center border border-(--hairline) text-(--gold)">
                                    {notification.status === "read" ? (
                                        <CheckCircle2 className="size-4" strokeWidth={1.4} />
                                    ) : (
                                        <Bell className="size-4" strokeWidth={1.4} />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-sm font-semibold text-(--bone)">{notification.message}</h2>
                                        <Badge
                                            variant="outline"
                                            className={
                                                notification.status === "unread"
                                                    ? "border-(--signal)/40 bg-(--signal)/10 text-(--signal)"
                                                    : "border-(--hairline) text-(--bone-muted)"
                                            }
                                        >
                                            {statusLabel[notification.status]}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-sm text-(--bone-muted)">{notification.booking.title}</p>
                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-(--bone-dim)">
                                        <span className="inline-flex items-center gap-2">
                                            <CalendarDays className="size-3.5" strokeWidth={1.4} />
                                            {formatNotificationDate(notification.booking.startTime)}
                                        </span>
                                        <span>
                                            {formatNotificationTime(notification.booking.startTime)} -{" "}
                                            {formatNotificationTime(notification.booking.endTime)}
                                        </span>
                                        <span>
                                            {notification.room.name}, {notification.room.location}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                            <div className="flex flex-col items-start gap-3 pl-14 md:items-end md:pl-0">
                                <time dateTime={notification.createdAt} className="text-xs text-(--bone-dim)">
                                    {formatNotificationDateTime(notification.createdAt)}
                                </time>
                                {notification.status === "unread" ? (
                                    <button
                                        type="button"
                                        onClick={() => markAsRead(notification.id)}
                                        disabled={isMarkingRead}
                                        className="inline-flex cursor-pointer items-center gap-2 border border-(--hairline) px-3 py-2 text-[0.62rem] font-semibold tracking-[0.2em] text-(--bone-dim) uppercase transition-colors hover:border-(--hairline-strong) hover:text-(--bone) disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <CheckCheck className="size-3.5" strokeWidth={1.4} />
                                        <span>Mark read</span>
                                    </button>
                                ) : null}
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </div>
    );
};

export const Route = createFileRoute("/_bookings/notifications")({
    validateSearch: notificationSearchSchema,
    search: {
        middlewares: [stripSearchParams(notificationFilterDefaults)],
    },
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(notificationsQueryOptions()),
    component: NotificationsPage,
});
