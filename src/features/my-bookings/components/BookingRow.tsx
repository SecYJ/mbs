import { Link } from "@tanstack/react-router";
import { Ban, CalendarDays, Check, Clock, Eye, Pencil, UserRound, Users, XCircle } from "lucide-react";

import { BookingCancellationForm } from "@/features/my-bookings/components/BookingCancellationForm";
import { useMyBookingsEdit } from "@/features/my-bookings/components/MyBookingsEditProvider";
import { useMyBookingsPage } from "@/features/my-bookings/hooks/useMyBookingsPage";
import {
    myBookingRsvpMeta,
    myBookingStatusMeta,
    type BookingHistoryItem,
} from "@/features/my-bookings/my-bookings.constants";
import { isSuperAdminRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

type BookingRowData = BookingHistoryItem & {
    displayDate: string;
    displayTime: string;
};

export const BookingRow = ({
    booking,
    currentUserId,
    currentUserRole,
}: {
    booking: BookingRowData;
    currentUserId: string;
    currentUserRole: string;
}) => {
    const {
        activeCancellationBookingId,
        cancelMutation,
        clearCancellation,
        requestCancellation,
        rsvpMutation,
        submitCancellation,
    } = useMyBookingsPage();
    const { requestEdit } = useMyBookingsEdit((state) => state.actions);
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
    const isConfirmingCancel = activeCancellationBookingId === booking.id;
    const isCancellingBooking = cancelMutation.variables?.data.bookingId === booking.id && cancelMutation.isPending;
    const cancelError =
        isConfirmingCancel && cancelMutation.variables?.data.bookingId === booking.id ? cancelMutation.error : null;
    const isResponding = rsvpMutation.variables?.data.bookingId === booking.id && rsvpMutation.isPending;
    const rsvpError = rsvpMutation.variables?.data.bookingId === booking.id ? rsvpMutation.error : null;
    const cancelErrorMessage = cancelError instanceof Error ? cancelError.message : null;
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
                            cancelErrorMessage={cancelErrorMessage}
                            isCancellingBooking={isCancellingBooking}
                            onClearCancel={() => clearCancellation(booking.id)}
                            onSubmitCancel={() => submitCancellation(booking.id)}
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
                    <button
                        type="button"
                        onClick={() => requestEdit(booking)}
                        className="inline-flex min-h-9 cursor-pointer items-center gap-2 border border-(--hairline) px-3 text-[0.62rem] font-semibold tracking-[0.22em] text-(--bone-dim) uppercase transition-colors hover:border-(--hairline-strong) hover:text-(--bone)"
                    >
                        <Pencil className="size-3.5" strokeWidth={1.4} />
                        <span>Edit</span>
                    </button>
                ) : null}
                {canCancel ? (
                    <button
                        type="button"
                        onClick={() => requestCancellation(booking.id)}
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
