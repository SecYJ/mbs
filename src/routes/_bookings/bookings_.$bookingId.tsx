import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { ReactNode } from "react";
import {
    ArrowLeft,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock,
    Mail,
    MapPin,
    Monitor,
    UserRound,
    Users,
    XCircle,
} from "lucide-react";

import { rsvpBookingInviteFn } from "@/features/bookings/services/fns";
import { bookingCalendarQueryOptions, bookingDetailsQueryOptions } from "@/features/bookings/services/queries";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";

export const Route = createFileRoute("/_bookings/bookings_/$bookingId")({
    loader: ({ context: { queryClient }, params }) =>
        queryClient.ensureQueryData(bookingDetailsQueryOptions(params.bookingId)),
    component: BookingDetailsPage,
});

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

const formatShortDate = (value: string | null) =>
    value
        ? new Date(value).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "";

const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

const formatDuration = (start: string, end: string) => {
    const minutes = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes} min`;
    if (remainingMinutes === 0) return `${hours} hr${hours === 1 ? "" : "s"}`;
    return `${hours} hr ${remainingMinutes} min`;
};

const getBookingState = (booking: { start: string; end: string; status: "active" | "cancelled" }) => {
    if (booking.status === "cancelled") {
        return {
            label: "Cancelled",
            className: "border-red-300/40 bg-red-500/10 text-red-100",
        };
    }

    const now = Date.now();
    const start = new Date(booking.start).getTime();
    const end = new Date(booking.end).getTime();

    if (end <= now) {
        return {
            label: "Completed",
            className: "border-[var(--hairline)] bg-[var(--surface-02)] text-[var(--bone-muted)]",
        };
    }

    if (start <= now && now < end) {
        return {
            label: "In Session",
            className: "border-[var(--signal)]/40 bg-[var(--signal)]/10 text-[var(--signal)]",
        };
    }

    return {
        label: "Upcoming",
        className: "border-[var(--gold)]/40 bg-[var(--gold-wash)] text-[var(--gold)]",
    };
};

const DetailItem = ({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) => (
    <div className="flex gap-3 border-t border-[var(--hairline)] py-5 first:border-t-0 first:pt-0">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-[var(--hairline)] text-[var(--gold)]">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="eyebrow">{label}</p>
            <div className="mt-1 text-sm leading-6 text-[var(--bone)]">{children}</div>
        </div>
    </div>
);

const PersonRow = ({
    name,
    email,
    status,
    current,
}: {
    name: string;
    email: string;
    status: "accepted" | "declined" | "pending" | "organizer";
    current?: boolean;
}) => {
    const statusMeta = {
        accepted: {
            label: "Accepted",
            className: "border-[var(--signal)]/40 bg-[var(--signal)]/10 text-[var(--signal)]",
            icon: <CheckCircle2 className="size-3.5" strokeWidth={1.4} />,
        },
        pending: {
            label: "Pending",
            className: "border-[var(--hairline)] bg-[var(--surface-02)] text-[var(--bone-muted)]",
            icon: <Clock className="size-3.5" strokeWidth={1.4} />,
        },
        declined: {
            label: "Declined",
            className: "border-red-300/40 bg-red-500/10 text-red-100",
            icon: <XCircle className="size-3.5" strokeWidth={1.4} />,
        },
        organizer: {
            label: "Organizer",
            className: "border-[var(--gold)]/40 bg-[var(--gold-wash)] text-[var(--gold)]",
            icon: <UserRound className="size-3.5" strokeWidth={1.4} />,
        },
    }[status];

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline)] py-4 first:border-t-0">
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--bone)]">
                    {name}
                    {current ? <span className="ml-2 text-xs font-normal text-[var(--bone-dim)]">You</span> : null}
                </p>
                <p className="mt-1 truncate text-xs text-[var(--bone-muted)]">{email}</p>
            </div>
            <span
                className={`inline-flex shrink-0 items-center gap-2 border px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] uppercase ${statusMeta.className}`}
            >
                {statusMeta.icon}
                {statusMeta.label}
            </span>
        </div>
    );
};

function BookingDetailsPage() {
    const { bookingId } = Route.useParams();
    const { data } = useSuspenseQuery(bookingDetailsQueryOptions(bookingId));
    const queryClient = useQueryClient();
    const rsvpBookingInvite = useServerFn(rsvpBookingInviteFn);
    const bookingState = getBookingState(data.booking);
    const pageLabel = data.currentUserAttendance ? "Booking Invite" : "Booking Details";
    const acceptedCount = data.attendees.filter((attendee) => attendee.status === "accepted").length;
    const declinedCount = data.attendees.filter((attendee) => attendee.status === "declined").length;
    const pendingCount = data.attendees.filter((attendee) => attendee.status === "pending").length;

    const rsvpMutation = useMutation({
        mutationFn: rsvpBookingInvite,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: bookingDetailsQueryOptions(bookingId).queryKey });
            await queryClient.invalidateQueries({ queryKey: bookingCalendarQueryOptions().queryKey });
            await queryClient.invalidateQueries({ queryKey: notificationsQueryOptions().queryKey });
        },
    });

    const rsvpError = rsvpMutation.error instanceof Error ? rsvpMutation.error.message : null;

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    to="/notifications"
                    className="inline-flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.24em] text-[var(--bone-dim)] uppercase no-underline transition-colors hover:text-[var(--bone)]"
                >
                    <ArrowLeft className="size-4" strokeWidth={1.4} />
                    <span>Notifications</span>
                </Link>
                <Link
                    to="/bookings"
                    className="text-[0.66rem] font-semibold tracking-[0.24em] text-[var(--bone-dim)] uppercase no-underline transition-colors hover:text-[var(--bone)]"
                >
                    Calendar
                </Link>
            </div>

            <header className="grid gap-6 border-b border-[var(--hairline)] pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="eyebrow eyebrow-gold">{pageLabel}</p>
                        <span
                            className={`inline-flex items-center border px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] uppercase ${bookingState.className}`}
                        >
                            {bookingState.label}
                        </span>
                    </div>
                    <h1 className="display-serif mt-3 text-4xl leading-none text-[var(--bone)] md:text-5xl">
                        {data.booking.title}
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--bone-muted)]">
                        {data.booking.description || "No description was added for this booking."}
                    </p>
                </div>

                {data.canRespond ? (
                    <div className="flex flex-col items-start gap-3 lg:items-end">
                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => rsvpMutation.mutate({ data: { bookingId, status: "accepted" } })}
                                disabled={rsvpMutation.isPending}
                                className="inline-flex min-h-12 cursor-pointer items-center gap-3 border border-[var(--bone)] bg-[var(--bone)] px-5 text-[0.66rem] font-semibold tracking-[0.24em] text-black uppercase transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Check className="size-4" strokeWidth={1.7} />
                                <span>{rsvpMutation.isPending ? "Saving" : "Accept"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => rsvpMutation.mutate({ data: { bookingId, status: "declined" } })}
                                disabled={rsvpMutation.isPending}
                                className="inline-flex min-h-12 cursor-pointer items-center gap-3 border border-red-300/40 bg-red-500/10 px-5 text-[0.66rem] font-semibold tracking-[0.24em] text-red-100 uppercase transition-all hover:border-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <XCircle className="size-4" strokeWidth={1.7} />
                                <span>Decline</span>
                            </button>
                        </div>
                        <p className="text-xs text-[var(--bone-dim)]">
                            Your RSVP is {data.currentUserAttendance?.status ?? "pending"}.
                        </p>
                        {rsvpError ? <p className="max-w-xs text-sm leading-5 text-red-100">{rsvpError}</p> : null}
                    </div>
                ) : null}
            </header>

            <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="border-y border-[var(--hairline)] py-1">
                    <DetailItem icon={<CalendarDays className="size-4" strokeWidth={1.4} />} label="Date">
                        <span>{formatDate(data.booking.start)}</span>
                    </DetailItem>
                    <DetailItem icon={<Clock className="size-4" strokeWidth={1.4} />} label="Time">
                        <span className="tabular-num text-[var(--gold)]">
                            {formatTime(data.booking.start)} - {formatTime(data.booking.end)}
                        </span>
                        <span className="ml-3 text-[var(--bone-muted)]">
                            {formatDuration(data.booking.start, data.booking.end)}
                        </span>
                    </DetailItem>
                    <DetailItem icon={<MapPin className="size-4" strokeWidth={1.4} />} label="Room">
                        <span className="font-medium">{data.room.name}</span>
                        <span className="ml-2 text-[var(--bone-muted)]">
                            {data.room.location} - {data.room.capacity} people
                        </span>
                    </DetailItem>
                    <DetailItem icon={<Monitor className="size-4" strokeWidth={1.4} />} label="Equipment">
                        {data.equipment.length === 0 ? (
                            <span className="text-[var(--bone-muted)]">No equipment assigned to this room.</span>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {data.equipment.map((item) => (
                                    <span
                                        key={`${item.name}-${item.model}`}
                                        className="border border-[var(--hairline)] bg-[var(--surface-01)] px-3 py-1.5 text-xs text-[var(--bone-muted)]"
                                    >
                                        <span className="text-[var(--bone)]">{item.name}</span>
                                        <span className="ml-2">
                                            {item.brand} {item.model}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </DetailItem>
                    {data.booking.status === "cancelled" ? (
                        <DetailItem icon={<XCircle className="size-4" strokeWidth={1.4} />} label="Cancellation">
                            <span>
                                Cancelled
                                {data.booking.cancelledAt ? ` ${formatShortDate(data.booking.cancelledAt)}` : ""}
                                {data.cancelledBy ? ` by ${data.cancelledBy.name}` : ""}
                            </span>
                            {data.booking.cancelReason ? (
                                <p className="mt-1 text-[var(--bone-muted)]">{data.booking.cancelReason}</p>
                            ) : null}
                        </DetailItem>
                    ) : null}
                </section>

                <aside className="space-y-7">
                    <section className="border-y border-[var(--hairline)] py-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="eyebrow eyebrow-gold">Responses</p>
                                <h2 className="mt-1 text-lg font-semibold text-[var(--bone)]">Attendees</h2>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[var(--bone-dim)]">
                                <Users className="size-4" strokeWidth={1.4} />
                                <span className="tabular-num">
                                    {acceptedCount}/{data.attendees.length}
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-3 divide-x divide-[var(--hairline)] border-y border-[var(--hairline)] py-3">
                            <div className="px-3">
                                <p className="eyebrow">Accepted</p>
                                <p className="mt-1 text-xl text-[var(--signal)]">{acceptedCount}</p>
                            </div>
                            <div className="px-3">
                                <p className="eyebrow">Declined</p>
                                <p className="mt-1 text-xl text-red-100">{declinedCount}</p>
                            </div>
                            <div className="px-3">
                                <p className="eyebrow">Pending</p>
                                <p className="mt-1 text-xl text-[var(--bone)]">{pendingCount}</p>
                            </div>
                        </div>

                        <div className="mt-5">
                            <PersonRow
                                name={data.organizer.name}
                                email={data.organizer.email}
                                status="organizer"
                                current={data.isOrganizer}
                            />
                            {data.attendees.length === 0 ? (
                                <div className="border-t border-[var(--hairline)] py-5 text-sm text-[var(--bone-muted)]">
                                    No attendees were invited.
                                </div>
                            ) : (
                                data.attendees.map((attendee) => (
                                    <PersonRow
                                        key={attendee.id}
                                        name={attendee.name}
                                        email={attendee.email}
                                        status={attendee.status}
                                        current={attendee.id === data.currentUserId}
                                    />
                                ))
                            )}
                        </div>
                    </section>

                    <section className="border-y border-[var(--hairline)] py-5">
                        <p className="eyebrow eyebrow-gold">Organizer</p>
                        <div className="mt-4 flex gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center border border-[var(--hairline)] text-[var(--gold)]">
                                <UserRound className="size-4" strokeWidth={1.4} />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[var(--bone)]">
                                    {data.organizer.name}
                                </p>
                                <p className="mt-1 inline-flex max-w-full items-center gap-2 truncate text-xs text-[var(--bone-muted)]">
                                    <Mail className="size-3.5 shrink-0" strokeWidth={1.4} />
                                    <span className="truncate">{data.organizer.email}</span>
                                </p>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
