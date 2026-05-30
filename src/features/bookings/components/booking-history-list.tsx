import { Ban, CalendarDays, History } from "lucide-react";

import type { BookingCalendarData } from "@/features/bookings/services/queries";

type BookingHistoryItem = BookingCalendarData["history"][number];

const HISTORY_STATUS_META: Record<BookingHistoryItem["status"], { label: string; className: string }> = {
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

const formatHistoryDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

const formatHistoryTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

export const BookingHistoryList = ({ bookings }: { bookings: BookingHistoryItem[] }) => {
    return (
        <section
            className="border-y border-[var(--hairline)] py-5"
            style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 500ms both" }}
        >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="eyebrow eyebrow-gold">History</p>
                    <h2 className="mt-1 text-lg font-semibold text-[var(--bone)]">My booking record</h2>
                </div>
                <span className="tabular-num text-[0.72rem] text-[var(--bone-dim)]">
                    {bookings.length} booking{bookings.length === 1 ? "" : "s"}
                </span>
            </div>

            {bookings.length === 0 ? (
                <div className="flex min-h-28 items-center justify-center border border-dashed border-[var(--hairline)] px-6 text-center text-sm text-[var(--bone-muted)]">
                    No booking history yet.
                </div>
            ) : (
                <div className="divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
                    {bookings.map((booking) => {
                        const statusMeta = HISTORY_STATUS_META[booking.status];

                        return (
                            <article
                                key={booking.id}
                                className="grid gap-4 px-1 py-4 md:grid-cols-[1fr_auto] md:items-center"
                            >
                                <div className="flex min-w-0 gap-4">
                                    <div
                                        className={`mt-1 flex size-10 shrink-0 items-center justify-center border ${
                                            booking.status === "cancelled"
                                                ? "border-red-300/40 text-red-100"
                                                : "border-[var(--hairline)] text-[var(--gold)]"
                                        }`}
                                    >
                                        {booking.status === "cancelled" ? (
                                            <Ban className="size-4" strokeWidth={1.4} />
                                        ) : (
                                            <History className="size-4" strokeWidth={1.4} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-semibold text-[var(--bone)]">
                                                {booking.title}
                                            </h3>
                                            <span
                                                className={`border px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.18em] uppercase ${statusMeta.className}`}
                                            >
                                                {statusMeta.label}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--bone-dim)]">
                                            <span className="inline-flex items-center gap-2">
                                                <CalendarDays className="size-3.5" strokeWidth={1.4} />
                                                {formatHistoryDate(booking.start)}
                                            </span>
                                            <span>
                                                {formatHistoryTime(booking.start)} - {formatHistoryTime(booking.end)}
                                            </span>
                                            <span>
                                                {booking.room.name}, {booking.room.location}
                                            </span>
                                            <span>Organizer: {booking.organizer.name}</span>
                                        </div>
                                        {booking.status === "cancelled" ? (
                                            <div className="mt-3 space-y-1 text-xs leading-5 text-[var(--bone-muted)]">
                                                <p>
                                                    Cancelled
                                                    {booking.cancelledAt
                                                        ? ` ${formatHistoryDate(booking.cancelledAt)}`
                                                        : ""}
                                                    {booking.cancelledBy ? ` by ${booking.cancelledBy.name}` : ""}
                                                </p>
                                                {booking.cancelReason ? <p>Reason: {booking.cancelReason}</p> : null}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="pl-14 text-xs text-[var(--bone-dim)] md:pl-0 md:text-right">
                                    {booking.attendees.length} attendee{booking.attendees.length === 1 ? "" : "s"}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
};
