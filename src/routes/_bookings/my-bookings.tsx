import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { compareAsc, format, parseISO } from "date-fns";
import { Ban, CalendarDays, Check, Clock, Eye, Pencil, Search, UserRound, Users, X, XCircle } from "lucide-react";
import { z } from "zod";

import { cancelBookingFn, rsvpBookingInviteFn } from "@/features/bookings/services/fns";
import { bookingCalendarQueryOptions, type BookingCalendarData } from "@/features/bookings/services/queries";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";
import { stripDefaultSearchParams } from "@/lib/router-search";

type BookingHistoryItem = BookingCalendarData["history"][number];
type BookingGroup = "all" | "upcoming" | "in-progress" | "past";

const myBookingsSearchDefaults = {
    group: "all" as BookingGroup,
    q: "",
    cancel: undefined as string | undefined,
};

const myBookingsSearchSchema = z.object({
    group: z.enum(["all", "upcoming", "in-progress", "past"]).default(myBookingsSearchDefaults.group),
    q: z.string().default(myBookingsSearchDefaults.q).catch(myBookingsSearchDefaults.q),
    cancel: z.uuid().optional().catch(undefined),
});

// react-doctor-disable-next-line react-doctor/only-export-components -- TanStack file routes must export Route.
export const Route = createFileRoute("/_bookings/my-bookings")({
    validateSearch: myBookingsSearchSchema,
    search: {
        middlewares: [stripDefaultSearchParams(myBookingsSearchDefaults)],
    },
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(bookingCalendarQueryOptions()),
    component: MyBookingsPage,
});

export function MyBookingsPage() {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const { group, q, cancel } = Route.useSearch();
    const navigate = useNavigate({ from: "/my-bookings" });
    const queryClient = useQueryClient();
    const cancelBooking = useServerFn(cancelBookingFn);
    const rsvpBookingInvite = useServerFn(rsvpBookingInviteFn);

    const visibleBookings = getVisibleBookings(data.history, group, q);
    const grouped = getGroupedBookings(visibleBookings);
    const ownedCount = data.history.filter((booking) => booking.organizer.id === data.currentUserId).length;
    const attendingCount = data.history.length - ownedCount;
    const activeCount = data.history.filter(
        (booking) => booking.status === "upcoming" || booking.status === "in-progress",
    ).length;

    const cancelMutation = useMutation({
        mutationFn: cancelBooking,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: bookingCalendarQueryOptions().queryKey });
            await queryClient.invalidateQueries({ queryKey: notificationsQueryOptions().queryKey });
            // react-doctor-disable-next-line react-doctor/tanstack-start-no-navigate-in-render -- Mutation success navigation only clears URL state after user action.
            await navigate({
                search: (prev) => ({ ...prev, cancel: undefined }),
                replace: true,
            });
        },
    });

    const rsvpMutation = useMutation({
        mutationFn: rsvpBookingInvite,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: bookingCalendarQueryOptions().queryKey });
            await queryClient.invalidateQueries({ queryKey: notificationsQueryOptions().queryKey });
        },
    });

    const updateSearch = (next: Partial<typeof myBookingsSearchDefaults>) => {
        // react-doctor-disable-next-line react-doctor/tanstack-start-no-navigate-in-render -- Search updates run inside event handlers.
        navigate({
            search: (prev) => ({ ...prev, ...next }),
            replace: true,
        });
    };

    const handleCancelSubmit = (bookingId: string, formData: FormData) => {
        const reason = formData.get("cancelReason");
        cancelMutation.mutate({
            data: {
                bookingId,
                cancelReason: z.string().catch("").parse(reason),
            },
        });
    };

    const handleRsvp = (bookingId: string, status: "accepted" | "declined") => {
        rsvpMutation.mutate({ data: { bookingId, status } });
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8">
            <header className="grid gap-6 border-b border-[var(--hairline)] pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                    <p className="eyebrow eyebrow-gold">BOOKINGS &middot; PERSONAL LEDGER</p>
                    <h1 className="display-italic mt-3 text-4xl leading-none font-normal text-[var(--bone)] md:text-5xl">
                        My Bookings
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--bone-muted)]">
                        Meetings you organize or attend, grouped by what needs attention now.
                    </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-[var(--hairline)] border-y border-[var(--hairline)] py-3">
                    <Stat label="Active" value={activeCount} accent={activeCount > 0 ? "signal" : undefined} />
                    <Stat label="Owned" value={ownedCount} />
                    <Stat label="Invited" value={attendingCount} />
                </div>
            </header>

            <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <label className="flex min-h-12 items-center gap-3 border-b border-[var(--hairline)] text-[var(--bone-muted)] transition-colors focus-within:border-[var(--gold)] focus-within:text-[var(--gold)]">
                    <Search className="size-4 shrink-0" strokeWidth={1.4} />
                    <span className="sr-only">Search bookings</span>
                    <input
                        aria-label="Search bookings"
                        value={q}
                        onChange={(event) => updateSearch({ q: event.target.value })}
                        placeholder="Search title, room, organizer, or attendee"
                        className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[var(--bone)] outline-none placeholder:text-[var(--bone-faint)]"
                    />
                    {q ? (
                        <button
                            type="button"
                            onClick={() => updateSearch({ q: "" })}
                            aria-label="Clear search"
                            className="flex size-8 cursor-pointer items-center justify-center text-[var(--bone-dim)] transition-colors hover:text-[var(--bone)]"
                        >
                            <X className="size-4" strokeWidth={1.4} />
                        </button>
                    ) : null}
                </label>

                <div className="flex flex-wrap border border-[var(--hairline)] p-1">
                    {groupOptions.map((option) => (
                        <Link
                            key={option.value}
                            to="/my-bookings"
                            search={(prev) => ({ ...prev, group: option.value })}
                            className={
                                group === option.value
                                    ? "border border-[var(--hairline-strong)] bg-[var(--surface-02)] px-4 py-2 text-[0.66rem] font-semibold tracking-[0.24em] text-[var(--bone)] uppercase no-underline"
                                    : "border border-transparent px-4 py-2 text-[0.66rem] font-semibold tracking-[0.24em] text-[var(--bone-dim)] uppercase no-underline transition-colors hover:border-[var(--hairline)] hover:text-[var(--bone)]"
                            }
                        >
                            {option.label}
                        </Link>
                    ))}
                </div>
            </section>

            {visibleBookings.length === 0 ? (
                <EmptyBookings hasQuery={q.trim().length > 0} />
            ) : (
                <div className="space-y-10">
                    {(group === "all" || group === "upcoming") && (
                        <BookingSection
                            title="Upcoming"
                            description="Reservations that have not started yet."
                            bookings={grouped.upcoming}
                            currentUserId={data.currentUserId}
                            cancelId={cancel}
                            cancelError={cancelMutation.error}
                            isCancelling={cancelMutation.isPending}
                            rsvpVariables={rsvpMutation.variables}
                            rsvpError={rsvpMutation.error}
                            isResponding={rsvpMutation.isPending}
                            onRequestCancel={(bookingId) => updateSearch({ cancel: bookingId })}
                            onClearCancel={() => updateSearch({ cancel: undefined })}
                            onCancelSubmit={handleCancelSubmit}
                            onRsvp={handleRsvp}
                        />
                    )}

                    {(group === "all" || group === "in-progress") && (
                        <BookingSection
                            title="In Session"
                            description="Meetings currently in progress."
                            bookings={grouped.inProgress}
                            currentUserId={data.currentUserId}
                            cancelId={cancel}
                            cancelError={cancelMutation.error}
                            isCancelling={cancelMutation.isPending}
                            rsvpVariables={rsvpMutation.variables}
                            rsvpError={rsvpMutation.error}
                            isResponding={rsvpMutation.isPending}
                            onRequestCancel={(bookingId) => updateSearch({ cancel: bookingId })}
                            onClearCancel={() => updateSearch({ cancel: undefined })}
                            onCancelSubmit={handleCancelSubmit}
                            onRsvp={handleRsvp}
                        />
                    )}

                    {(group === "all" || group === "past") && (
                        <BookingSection
                            title="Past"
                            description="Completed and cancelled booking records."
                            bookings={grouped.past}
                            currentUserId={data.currentUserId}
                            cancelId={cancel}
                            cancelError={cancelMutation.error}
                            isCancelling={cancelMutation.isPending}
                            rsvpVariables={rsvpMutation.variables}
                            rsvpError={rsvpMutation.error}
                            isResponding={rsvpMutation.isPending}
                            onRequestCancel={(bookingId) => updateSearch({ cancel: bookingId })}
                            onClearCancel={() => updateSearch({ cancel: undefined })}
                            onCancelSubmit={handleCancelSubmit}
                            onRsvp={handleRsvp}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

const groupOptions: Array<{ value: BookingGroup; label: string }> = [
    { value: "all", label: "All" },
    { value: "upcoming", label: "Upcoming" },
    { value: "in-progress", label: "In Session" },
    { value: "past", label: "Past" },
];

const statusMeta: Record<
    BookingHistoryItem["status"],
    {
        label: string;
        className: string;
    }
> = {
    upcoming: {
        label: "Upcoming",
        className: "border-[var(--gold)]/40 bg-[var(--gold-wash)] text-[var(--gold)]",
    },
    "in-progress": {
        label: "In Session",
        className: "border-[var(--signal)]/40 bg-[var(--signal)]/10 text-[var(--signal)]",
    },
    completed: {
        label: "Completed",
        className: "border-[var(--hairline)] bg-[var(--surface-02)] text-[var(--bone-muted)]",
    },
    cancelled: {
        label: "Cancelled",
        className: "border-red-300/40 bg-red-500/10 text-red-100",
    },
};

const rsvpMeta = {
    accepted: {
        label: "Accepted",
        className: "border-[var(--signal)]/40 bg-[var(--signal)]/10 text-[var(--signal)]",
    },
    declined: {
        label: "Declined",
        className: "border-red-300/40 bg-red-500/10 text-red-100",
    },
    pending: {
        label: "Pending RSVP",
        className: "border-[var(--hairline)] bg-[var(--surface-02)] text-[var(--bone-muted)]",
    },
};

const formatDate = (value: string) => format(parseISO(value), "EEE, MMM d, yyyy");

const formatTime = (value: string) => format(parseISO(value), "HH:mm");

const matchesGroup = (booking: BookingHistoryItem, group: BookingGroup) => {
    if (group === "all") return true;
    if (group === "past") return booking.status === "completed" || booking.status === "cancelled";
    return booking.status === group;
};

const matchesQuery = (booking: BookingHistoryItem, query: string) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;

    const haystack = [
        booking.title,
        booking.description,
        booking.room.name,
        booking.room.location,
        booking.organizer.name,
        booking.organizer.email,
        ...booking.attendees.flatMap((attendee) => [attendee.name, attendee.email]),
    ]
        .join(" ")
        .toLowerCase();

    return haystack.includes(normalized);
};

const sortBookingsForGroup = (bookings: BookingHistoryItem[], group: BookingGroup) =>
    bookings.toSorted((a, b) => {
        const comparison = compareAsc(parseISO(a.start), parseISO(b.start));
        return group === "past" ? -comparison : comparison;
    });

const getVisibleBookings = (bookings: BookingHistoryItem[], group: BookingGroup, q: string) =>
    bookings.filter((booking) => matchesGroup(booking, group) && matchesQuery(booking, q));

const getGroupedBookings = (bookings: BookingHistoryItem[]) => ({
    upcoming: sortBookingsForGroup(
        bookings.filter((booking) => booking.status === "upcoming"),
        "upcoming",
    ),
    inProgress: sortBookingsForGroup(
        bookings.filter((booking) => booking.status === "in-progress"),
        "in-progress",
    ),
    past: sortBookingsForGroup(
        bookings.filter((booking) => booking.status === "completed" || booking.status === "cancelled"),
        "past",
    ),
});

const Stat = ({ label, value, accent }: { label: string; value: number; accent?: "signal" }) => (
    <div className="min-w-24 px-4 text-center">
        <p className="eyebrow">{label}</p>
        <p
            className={`tabular-num mt-1 text-xl font-semibold ${accent === "signal" ? "text-(--signal)" : "text-(--bone)"}`}
        >
            {value}
        </p>
    </div>
);

const EmptyBookings = ({ hasQuery }: { hasQuery: boolean }) => (
    <section className="flex min-h-80 flex-col items-center justify-center border border-dashed border-(--hairline) px-6 text-center">
        <CalendarDays className="size-8 text-(--bone-dim)" strokeWidth={1.4} />
        <h2 className="mt-5 text-lg font-semibold text-(--bone)">
            {hasQuery ? "No matching bookings" : "No bookings yet"}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-(--bone-muted)">
            {hasQuery
                ? "Adjust the search or group filter to widen the ledger."
                : "Bookings you organize or attend will collect here once the calendar starts moving."}
        </p>
    </section>
);

const BookingSection = ({
    title,
    description,
    bookings,
    currentUserId,
    cancelId,
    cancelError,
    isCancelling,
    rsvpVariables,
    rsvpError,
    isResponding,
    onRequestCancel,
    onClearCancel,
    onCancelSubmit,
    onRsvp,
}: {
    title: string;
    description: string;
    bookings: BookingHistoryItem[];
    currentUserId: string;
    cancelId?: string;
    cancelError: unknown;
    isCancelling: boolean;
    rsvpVariables?: { data: { bookingId: string; status: "accepted" | "declined" } };
    rsvpError: unknown;
    isResponding: boolean;
    onRequestCancel: (bookingId: string) => void;
    onClearCancel: () => void;
    onCancelSubmit: (bookingId: string, formData: FormData) => void;
    onRsvp: (bookingId: string, status: "accepted" | "declined") => void;
}) => (
    <section className="border-y border-(--hairline) py-5">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
                <p className="eyebrow eyebrow-gold">{title}</p>
                <h2 className="display-italic mt-1 text-2xl leading-none font-normal text-(--bone)">{title}</h2>
                <p className="mt-2 text-sm text-(--bone-muted)">{description}</p>
            </div>
            <span className="tabular-num text-[0.72rem] text-(--bone-dim)">
                {bookings.length} booking{bookings.length === 1 ? "" : "s"}
            </span>
        </div>

        {bookings.length === 0 ? (
            <div className="flex min-h-28 items-center justify-center border border-dashed border-(--hairline) px-6 text-center text-sm text-(--bone-muted)">
                Nothing in this group.
            </div>
        ) : (
            <div className="divide-y divide-(--hairline) border-y border-(--hairline)">
                {bookings.map((booking) => (
                    <BookingRow
                        key={booking.id}
                        booking={booking}
                        currentUserId={currentUserId}
                        isConfirmingCancel={cancelId === booking.id}
                        cancelError={cancelId === booking.id ? cancelError : null}
                        isCancelling={isCancelling}
                        rsvpError={rsvpVariables?.data.bookingId === booking.id ? rsvpError : null}
                        isResponding={rsvpVariables?.data.bookingId === booking.id && isResponding}
                        onRequestCancel={() => onRequestCancel(booking.id)}
                        onClearCancel={onClearCancel}
                        onCancelSubmit={(formData) => onCancelSubmit(booking.id, formData)}
                        onRsvp={(status) => onRsvp(booking.id, status)}
                    />
                ))}
            </div>
        )}
    </section>
);

const BookingRow = ({
    booking,
    currentUserId,
    isConfirmingCancel,
    cancelError,
    isCancelling,
    rsvpError,
    isResponding,
    onRequestCancel,
    onClearCancel,
    onCancelSubmit,
    onRsvp,
}: {
    booking: BookingHistoryItem;
    currentUserId: string;
    isConfirmingCancel: boolean;
    cancelError: unknown;
    isCancelling: boolean;
    rsvpError: unknown;
    isResponding: boolean;
    onRequestCancel: () => void;
    onClearCancel: () => void;
    onCancelSubmit: (formData: FormData) => void;
    onRsvp: (status: "accepted" | "declined") => void;
}) => {
    const isOrganizer = booking.organizer.id === currentUserId;
    const canEdit = isOrganizer && booking.status === "upcoming";
    const canCancel = isOrganizer && (booking.status === "upcoming" || booking.status === "in-progress");
    const attendanceStatus = booking.currentUserAttendance?.status ?? null;
    const canRespond =
        !isOrganizer && !!attendanceStatus && (booking.status === "upcoming" || booking.status === "in-progress");
    const meta = statusMeta[booking.status];
    const responseMeta = attendanceStatus ? rsvpMeta[attendanceStatus] : null;
    const cancelMessage = cancelError instanceof Error ? cancelError.message : null;
    const rsvpMessage = rsvpError instanceof Error ? rsvpError.message : null;

    return (
        <article className="grid gap-4 px-1 py-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="flex min-w-0 gap-4">
                <div className="mt-1 flex size-10 shrink-0 items-center justify-center border border-(--hairline) text-(--gold)">
                    {booking.status === "in-progress" ? (
                        <Clock className="size-4" strokeWidth={1.4} />
                    ) : (
                        <CalendarDays className="size-4" strokeWidth={1.4} />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-(--bone)">{booking.title}</h3>
                        <span
                            className={`border px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.18em] uppercase ${meta.className}`}
                        >
                            {meta.label}
                        </span>
                        <span className="border border-(--hairline) px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.18em] text-(--bone-dim) uppercase">
                            {isOrganizer ? "Organizer" : "Attendee"}
                        </span>
                        {responseMeta ? (
                            <span
                                className={`border px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.18em] uppercase ${responseMeta.className}`}
                            >
                                {responseMeta.label}
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-(--bone-dim)">
                        <span className="inline-flex items-center gap-2">
                            <CalendarDays className="size-3.5" strokeWidth={1.4} />
                            {formatDate(booking.start)}
                        </span>
                        <span className="tabular-num">
                            {formatTime(booking.start)} - {formatTime(booking.end)}
                        </span>
                        <span>
                            {booking.room.name}, {booking.room.location}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <Users className="size-3.5" strokeWidth={1.4} />
                            {booking.attendees.length} attendee{booking.attendees.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    <p className="mt-2 inline-flex max-w-full items-center gap-2 truncate text-xs text-(--bone-muted)">
                        <UserRound className="size-3.5 shrink-0" strokeWidth={1.4} />
                        <span className="truncate">Organized by {booking.organizer.name}</span>
                    </p>

                    {booking.status === "cancelled" ? (
                        <p className="mt-3 text-xs leading-5 text-(--bone-muted)">
                            Cancelled{booking.cancelledBy ? ` by ${booking.cancelledBy.name}` : ""}
                            {booking.cancelReason ? `: ${booking.cancelReason}` : ""}
                        </p>
                    ) : null}

                    {rsvpMessage ? <p className="mt-3 text-xs leading-5 text-red-100">{rsvpMessage}</p> : null}

                    {isConfirmingCancel ? (
                        <form
                            action={(formData) => onCancelSubmit(formData)}
                            className="mt-5 space-y-3 border border-red-300/30 bg-red-500/10 p-4"
                        >
                            <div>
                                <p className="text-sm font-semibold text-red-100">Cancel this booking?</p>
                                <p className="mt-1 text-xs leading-5 text-red-100/70">
                                    Attendees will be notified and the booking will stay visible in history.
                                </p>
                            </div>
                            <textarea
                                name="cancelReason"
                                aria-label="Cancellation reason"
                                rows={3}
                                placeholder="Reason (optional)"
                                className="w-full resize-none border border-red-300/30 bg-black/20 px-3 py-2 text-sm text-red-50 outline-none placeholder:text-red-100/35 focus:border-red-200"
                            />
                            {cancelMessage ? <p className="text-xs text-red-100">{cancelMessage}</p> : null}
                            <div className="flex flex-wrap justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClearCancel}
                                    disabled={isCancelling}
                                    className="min-h-9 cursor-pointer border border-red-100/20 px-4 text-[0.62rem] font-semibold tracking-[0.24em] text-red-100/70 uppercase transition-colors hover:border-red-100/40 hover:text-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Keep
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCancelling}
                                    className="inline-flex min-h-9 cursor-pointer items-center gap-2 border border-red-200/70 bg-red-500/20 px-4 text-[0.62rem] font-semibold tracking-[0.24em] text-red-50 uppercase transition-colors hover:bg-red-500/30 disabled:cursor-wait disabled:opacity-60"
                                >
                                    <Ban className="size-3.5" strokeWidth={1.5} />
                                    <span>{isCancelling ? "Cancelling" : "Confirm"}</span>
                                </button>
                            </div>
                        </form>
                    ) : null}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pl-14 lg:justify-end lg:pl-0">
                <Link
                    to="/bookings/$bookingId"
                    params={{ bookingId: booking.id }}
                    className="inline-flex min-h-9 items-center gap-2 border border-[var(--hairline)] px-3 text-[0.62rem] font-semibold tracking-[0.22em] text-[var(--bone-dim)] uppercase no-underline transition-colors hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
                >
                    <Eye className="size-3.5" strokeWidth={1.4} />
                    <span>View</span>
                </Link>
                {canEdit ? (
                    <Link
                        to="/bookings"
                        search={{ bookingId: booking.id }}
                        className="inline-flex min-h-9 items-center gap-2 border border-[var(--hairline)] px-3 text-[0.62rem] font-semibold tracking-[0.22em] text-[var(--bone-dim)] uppercase no-underline transition-colors hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
                    >
                        <Pencil className="size-3.5" strokeWidth={1.4} />
                        <span>Edit</span>
                    </Link>
                ) : null}
                {canCancel ? (
                    <button
                        type="button"
                        onClick={onRequestCancel}
                        className="inline-flex min-h-9 cursor-pointer items-center gap-2 border border-red-300/40 bg-red-500/10 px-3 text-[0.62rem] font-semibold tracking-[0.22em] text-red-100 uppercase transition-colors hover:border-red-200 hover:bg-red-500/20"
                    >
                        <Ban className="size-3.5" strokeWidth={1.4} />
                        <span>Cancel</span>
                    </button>
                ) : null}
                {canRespond && attendanceStatus !== "accepted" ? (
                    <button
                        type="button"
                        onClick={() => onRsvp("accepted")}
                        disabled={isResponding}
                        className="inline-flex min-h-9 cursor-pointer items-center gap-2 border border-[var(--signal)]/40 bg-[var(--signal)]/10 px-3 text-[0.62rem] font-semibold tracking-[0.22em] text-[var(--signal)] uppercase transition-colors hover:border-[var(--signal)] disabled:cursor-wait disabled:opacity-60"
                    >
                        <Check className="size-3.5" strokeWidth={1.4} />
                        <span>{isResponding ? "Saving" : "Accept"}</span>
                    </button>
                ) : null}
                {canRespond && attendanceStatus !== "declined" ? (
                    <button
                        type="button"
                        onClick={() => onRsvp("declined")}
                        disabled={isResponding}
                        className="inline-flex min-h-9 cursor-pointer items-center gap-2 border border-red-300/40 bg-red-500/10 px-3 text-[0.62rem] font-semibold tracking-[0.22em] text-red-100 uppercase transition-colors hover:border-red-200 hover:bg-red-500/20 disabled:cursor-wait disabled:opacity-60"
                    >
                        <XCircle className="size-3.5" strokeWidth={1.4} />
                        <span>Decline</span>
                    </button>
                ) : null}
            </div>
        </article>
    );
};
