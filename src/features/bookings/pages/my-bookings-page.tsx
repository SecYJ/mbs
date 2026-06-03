import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import { Ban, CalendarDays, Check, Clock, Eye, Pencil, Search, UserRound, Users, X, XCircle } from "lucide-react";

import { MyBookingsHeader } from "@/features/bookings/components/my-bookings-header";
import { useMyBookingsPage } from "@/features/bookings/hooks/useMyBookingsPage";
import {
    type BookingHistoryItem,
    type MyBookingGroup,
    myBookingGroupOptions,
    myBookingRsvpMeta,
    myBookingStatusMeta,
    myBookingsSearchDefaults,
} from "@/features/bookings/my-bookings.constants";
import { myBookingsQueryOptions } from "@/features/bookings/services/queries";
import { isSuperAdminRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

const myBookingsRoute = getRouteApi("/_bookings/my-bookings");

type MyBookingRowItem = BookingHistoryItem & {
    displayDate: string;
    displayTime: string;
};

type MyBookingsPageModel = ReturnType<typeof useMyBookingsPage>;

export const MyBookingsPage = () => (
    <div className="mx-auto w-full max-w-7xl space-y-8">
        <MyBookingsHeader />
        <MyBookingsPageHost />
    </div>
);

const MyBookingsPageHost = () => {
    const { group, q } = myBookingsRoute.useSearch();
    const navigate = myBookingsRoute.useNavigate();
    const { data } = useSuspenseQuery(myBookingsQueryOptions({ group, q }));

    const updateSearch = (next: Partial<typeof myBookingsSearchDefaults>) => {
        navigate({
            search: (prev) => ({ ...prev, ...next }),
            replace: true,
        });
    };

    return (
        <>
            <MyBookingsFilterControls
                group={group}
                q={q}
                onSearchChange={(value) => updateSearch({ q: value })}
                onSearchClear={() => updateSearch({ q: "" })}
            />

            {data.history.length > 0 ? <MyBookingsFilteredPage /> : <EmptyBookings hasQuery={q.trim().length > 0} />}
        </>
    );
};

const MyBookingsFilterControls = ({
    group,
    q,
    onSearchChange,
    onSearchClear,
}: {
    group: MyBookingGroup;
    q: string;
    onSearchChange: (value: string) => void;
    onSearchClear: () => void;
}) => (
    <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <label className="flex min-h-12 items-center gap-3 border-b border-(--hairline) text-(--bone-muted) transition-colors focus-within:border-(--gold) focus-within:text-(--gold)">
            <Search className="size-4 shrink-0" strokeWidth={1.4} />
            <span className="sr-only">Search bookings</span>
            <input
                aria-label="Search bookings"
                value={q}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search title, room, organizer, or attendee"
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-(--bone) outline-none placeholder:text-(--bone-faint)"
            />
            {q ? (
                <button
                    type="button"
                    onClick={onSearchClear}
                    aria-label="Clear search"
                    className="flex size-8 cursor-pointer items-center justify-center text-(--bone-dim) transition-colors hover:text-(--bone)"
                >
                    <X className="size-4" strokeWidth={1.4} />
                </button>
            ) : null}
        </label>

        <div className="flex flex-wrap border border-(--hairline) p-1">
            {myBookingGroupOptions.map((option) => (
                <Link
                    key={option.value}
                    to="/my-bookings"
                    search={(prev) => ({ ...prev, group: option.value })}
                    className={cn(
                        "border px-4 py-2 text-[0.66rem] font-semibold tracking-[0.24em] uppercase no-underline",
                        group === option.value
                            ? "border-(--hairline-strong) bg-(--surface-02) text-(--bone)"
                            : "border-transparent text-(--bone-dim) transition-colors hover:border-(--hairline) hover:text-(--bone)",
                    )}
                >
                    {option.label}
                </Link>
            ))}
        </div>
    </section>
);

const MyBookingsFilteredPage = () => {
    const model = useMyBookingsPage();
    const { bookings } = model;

    return (
        <section className="border-y border-(--hairline) py-5">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="eyebrow eyebrow-gold">{model.sectionMeta.title}</p>
                    <h2 className="display-italic mt-1 text-2xl leading-none font-normal text-(--bone)">
                        {model.sectionMeta.title}
                    </h2>
                    <p className="mt-2 text-sm text-(--bone-muted)">{model.sectionMeta.description}</p>
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
                    {bookings.map((booking) => {
                        const cancellationIndex = model.cancellationFields.findIndex(
                            (cancellation) => cancellation.bookingId === booking.id,
                        );

                        return (
                            <BookingRow
                                key={booking.id}
                                booking={booking}
                                currentUserId={model.currentUserId}
                                currentUserRole={model.currentUserRole}
                                isConfirmingCancel={cancellationIndex !== -1}
                                cancellationForm={model.cancellationForm}
                                cancellationIndex={cancellationIndex}
                                cancelMutation={model.cancelMutation}
                                rsvpMutation={model.rsvpMutation}
                                onRequestCancel={() => model.requestCancellation(booking.id)}
                                onClearCancel={() => model.clearCancellation(booking.id)}
                                onSubmitCancel={() => model.submitCancellation(booking.id)}
                            />
                        );
                    })}
                </div>
            )}
        </section>
    );
};

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

const BookingRow = ({
    booking,
    currentUserId,
    currentUserRole,
    isConfirmingCancel,
    cancellationForm,
    cancellationIndex,
    cancelMutation,
    rsvpMutation,
    onRequestCancel,
    onClearCancel,
    onSubmitCancel,
}: {
    booking: MyBookingRowItem;
    currentUserId: string;
    currentUserRole: string;
    isConfirmingCancel: boolean;
    cancellationForm: MyBookingsPageModel["cancellationForm"];
    cancellationIndex: number;
    cancelMutation: MyBookingsPageModel["cancelMutation"];
    rsvpMutation: MyBookingsPageModel["rsvpMutation"];
    onRequestCancel: () => void;
    onClearCancel: () => void;
    onSubmitCancel: () => void;
}) => {
    const isOrganizer = booking.organizer.id === currentUserId;
    const canCancelAsSuperAdmin = isSuperAdminRole(currentUserRole);
    const canEdit = isOrganizer && booking.status === "upcoming";
    const canCancel =
        (isOrganizer || canCancelAsSuperAdmin) && (booking.status === "upcoming" || booking.status === "in-progress");
    const attendanceStatus = booking.currentUserAttendance?.status ?? null;
    const canRespond =
        !isOrganizer && !!attendanceStatus && (booking.status === "upcoming" || booking.status === "in-progress");
    const meta = myBookingStatusMeta[booking.status];
    const responseMeta = attendanceStatus ? myBookingRsvpMeta[attendanceStatus] : null;
    const isCancellingBooking = cancelMutation.variables?.data.bookingId === booking.id && cancelMutation.isPending;
    const cancelError =
        isConfirmingCancel && cancelMutation.variables?.data.bookingId === booking.id ? cancelMutation.error : null;
    const cancelValidationError = cancellationForm.formState.errors.cancellations?.[cancellationIndex]?.reason?.message;
    const isResponding = rsvpMutation.variables?.data.bookingId === booking.id && rsvpMutation.isPending;
    const rsvpError = rsvpMutation.variables?.data.bookingId === booking.id ? rsvpMutation.error : null;
    const cancelMessage = cancelValidationError ?? (cancelError instanceof Error ? cancelError.message : null);
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
                            className={cn(
                                "border px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.18em] uppercase",
                                meta.className,
                            )}
                        >
                            {meta.label}
                        </span>
                        <span className="border border-(--hairline) px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.18em] text-(--bone-dim) uppercase">
                            {isOrganizer ? "Organizer" : "Attendee"}
                        </span>
                        {responseMeta ? (
                            <span
                                className={cn(
                                    "border px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.18em] uppercase",
                                    responseMeta.className,
                                )}
                            >
                                {responseMeta.label}
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-(--bone-dim)">
                        <span className="inline-flex items-center gap-2">
                            <CalendarDays className="size-3.5" strokeWidth={1.4} />
                            {booking.displayDate}
                        </span>
                        <span className="tabular-num">{booking.displayTime}</span>
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
                        <BookingCancellationForm
                            cancellationForm={cancellationForm}
                            cancellationIndex={cancellationIndex}
                            cancelMessage={cancelMessage}
                            isCancellingBooking={isCancellingBooking}
                            onClearCancel={onClearCancel}
                            onSubmitCancel={onSubmitCancel}
                        />
                    ) : null}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pl-14 lg:justify-end lg:pl-0">
                <Link
                    to="/bookings/$bookingId"
                    params={{ bookingId: booking.id }}
                    className="inline-flex min-h-9 items-center gap-2 border border-(--hairline) px-3 text-[0.62rem] font-semibold tracking-[0.22em] text-(--bone-dim) uppercase no-underline transition-colors hover:border-(--hairline-strong) hover:text-(--bone)"
                >
                    <Eye className="size-3.5" strokeWidth={1.4} />
                    <span>View</span>
                </Link>
                {canEdit ? (
                    <Link
                        to="/bookings"
                        search={{ bookingId: booking.id }}
                        className="inline-flex min-h-9 items-center gap-2 border border-(--hairline) px-3 text-[0.62rem] font-semibold tracking-[0.22em] text-(--bone-dim) uppercase no-underline transition-colors hover:border-(--hairline-strong) hover:text-(--bone)"
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
                        onClick={() => rsvpMutation.mutate({ data: { bookingId: booking.id, status: "accepted" } })}
                        disabled={isResponding}
                        className="inline-flex min-h-9 cursor-pointer items-center gap-2 border border-(--signal)/40 bg-(--signal)/10 px-3 text-[0.62rem] font-semibold tracking-[0.22em] text-(--signal) uppercase transition-colors hover:border-(--signal) disabled:cursor-wait disabled:opacity-60"
                    >
                        <Check className="size-3.5" strokeWidth={1.4} />
                        <span>{isResponding ? "Saving" : "Accept"}</span>
                    </button>
                ) : null}
                {canRespond && attendanceStatus !== "declined" ? (
                    <button
                        type="button"
                        onClick={() => rsvpMutation.mutate({ data: { bookingId: booking.id, status: "declined" } })}
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

const BookingCancellationForm = ({
    cancellationForm,
    cancellationIndex,
    cancelMessage,
    isCancellingBooking,
    onClearCancel,
    onSubmitCancel,
}: {
    cancellationForm: MyBookingsPageModel["cancellationForm"];
    cancellationIndex: number;
    cancelMessage: string | null;
    isCancellingBooking: boolean;
    onClearCancel: () => void;
    onSubmitCancel: () => void;
}) => {
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmitCancel();
            }}
            noValidate
            className="mt-5 space-y-3 border border-red-300/30 bg-red-500/10 p-4"
        >
            <div>
                <p className="text-sm font-semibold text-red-100">Cancel this booking?</p>
                <p className="mt-1 text-xs leading-5 text-red-100/70">
                    Attendees will be notified and the booking will stay visible in history.
                </p>
            </div>
            <textarea
                aria-label="Cancellation reason"
                rows={3}
                placeholder="Reason (optional)"
                className="w-full resize-none border border-red-300/30 bg-black/20 px-3 py-2 text-sm text-red-50 outline-none placeholder:text-red-100/35 focus:border-red-200"
                {...cancellationForm.register(`cancellations.${cancellationIndex}.reason` as const)}
            />
            {cancelMessage ? <p className="text-xs text-red-100">{cancelMessage}</p> : null}
            <div className="flex flex-wrap justify-end gap-3">
                <button
                    type="button"
                    onClick={onClearCancel}
                    disabled={isCancellingBooking}
                    className="min-h-9 cursor-pointer border border-red-100/20 px-4 text-[0.62rem] font-semibold tracking-[0.24em] text-red-100/70 uppercase transition-colors hover:border-red-100/40 hover:text-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Keep
                </button>
                <button
                    type="submit"
                    disabled={isCancellingBooking}
                    className="inline-flex min-h-9 cursor-pointer items-center gap-2 border border-red-200/70 bg-red-500/20 px-4 text-[0.62rem] font-semibold tracking-[0.24em] text-red-50 uppercase transition-colors hover:bg-red-500/30 disabled:cursor-wait disabled:opacity-60"
                >
                    <Ban className="size-3.5" strokeWidth={1.5} />
                    <span>{isCancellingBooking ? "Cancelling" : "Confirm"}</span>
                </button>
            </div>
        </form>
    );
};
