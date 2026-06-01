import { useState } from "react";
import { addDays, format, formatDuration, intervalToDuration, isPast as isPastDate, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import type { RoomBookingDaySegment } from "@/features/bookings/hooks/useRoomBookingDayModel";
import type { BookingCalendarEvent } from "@/features/bookings/utils/booking-calendar.utils";
import { cn } from "@/lib/utils";

const formatSlotDuration = (start: Date, end: Date) =>
    formatDuration(intervalToDuration({ start, end }), { format: ["hours", "minutes"] }) || "0 minutes";

const BookedRoomSlot = ({
    segment,
    onOpen,
}: {
    segment: Extract<RoomBookingDaySegment, { type: "booking" }>;
    onOpen: () => void;
}) => {
    const past = isPastDate(new Date(segment.event.end));

    return (
        <button
            type="button"
            onClick={onOpen}
            className={cn(
                "grid w-full cursor-pointer gap-3 border-t border-[var(--hairline)] px-1 py-4 text-left first:border-t-0 sm:grid-cols-[120px_1fr_auto] sm:items-center",
                past ? "opacity-55" : "transition-colors hover:bg-[var(--surface-01)]",
            )}
        >
            <div className="tabular-num text-[0.72rem] font-semibold tracking-[0.12em] text-[var(--gold)] uppercase">
                {format(segment.start, "HH:mm")} - {format(segment.end, "HH:mm")}
            </div>
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--bone)]">{segment.event.title}</p>
                <p className="mt-1 truncate text-xs text-[var(--bone-muted)]">
                    Organized by {segment.event.organizer.name}
                </p>
            </div>
            <span className="justify-self-start border border-[var(--gold)]/40 bg-[var(--gold-wash)] px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.18em] text-[var(--gold)] uppercase sm:justify-self-end">
                Booked
            </span>
        </button>
    );
};

const AvailableRoomSlot = ({
    segment,
    roomAvailable,
    onBook,
}: {
    segment: Extract<RoomBookingDaySegment, { type: "free" }>;
    roomAvailable: boolean;
    onBook: (slot: { start: Date; end: Date }) => void;
}) => {
    const [now] = useState(() => Date.now());
    const slot = segment.bookableSlot;
    const isPast = segment.end.getTime() <= now;
    const canBook = roomAvailable && !isPast && !!slot;

    return (
        <div className="grid gap-3 border-t border-[var(--hairline)] px-1 py-4 first:border-t-0 sm:grid-cols-[120px_1fr_auto] sm:items-center">
            <div className="tabular-num text-[0.72rem] font-semibold tracking-[0.12em] text-[var(--bone-dim)] uppercase">
                {format(segment.start, "HH:mm")} - {format(segment.end, "HH:mm")}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--bone)]">Open</p>
                <p className="mt-1 text-xs text-[var(--bone-muted)]">
                    {formatSlotDuration(segment.start, segment.end)}
                </p>
            </div>
            <button
                type="button"
                onClick={() => slot && onBook(slot)}
                disabled={!canBook}
                className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 border border-[var(--hairline)] px-3 text-[0.62rem] font-semibold tracking-[0.2em] text-[var(--bone-dim)] uppercase transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--hairline)] disabled:hover:text-[var(--bone-dim)]"
            >
                <Plus className="size-3.5" strokeWidth={1.6} />
                <span>Book</span>
            </button>
        </div>
    );
};

export const RoomBookingSchedule = ({
    onBook,
    onDateChange,
    onOpenBooking,
    roomAvailable,
    segments,
    selectedDate,
}: {
    onBook: (slot: { start: Date; end: Date }) => void;
    onDateChange: (date: Date) => void;
    onOpenBooking: (event: BookingCalendarEvent) => void;
    roomAvailable: boolean;
    segments: RoomBookingDaySegment[];
    selectedDate: Date;
}) => {
    const goToToday = () => {
        onDateChange(startOfDay(new Date()));
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[var(--hairline)] py-4">
                <div>
                    <p className="eyebrow eyebrow-gold">Schedule</p>
                    <h2 className="mt-1 text-xl font-semibold text-[var(--bone)]">
                        {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </h2>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onDateChange(addDays(selectedDate, -1))}
                        aria-label="Previous day"
                        className="flex size-9 cursor-pointer items-center justify-center border border-[var(--hairline)] text-[var(--bone-dim)] transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
                    >
                        <ChevronLeft className="size-4" strokeWidth={1.4} />
                    </button>
                    <button
                        type="button"
                        onClick={goToToday}
                        className="h-9 cursor-pointer border border-[var(--hairline)] px-4 text-[0.66rem] font-semibold tracking-[0.24em] text-[var(--bone-dim)] uppercase transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        onClick={() => onDateChange(addDays(selectedDate, 1))}
                        aria-label="Next day"
                        className="flex size-9 cursor-pointer items-center justify-center border border-[var(--hairline)] text-[var(--bone-dim)] transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
                    >
                        <ChevronRight className="size-4" strokeWidth={1.4} />
                    </button>
                </div>
            </div>

            <div className="border-y border-[var(--hairline)] py-1">
                {segments.map((segment) =>
                    segment.type === "booking" ? (
                        <BookedRoomSlot
                            key={`booking-${segment.event.id}`}
                            segment={segment}
                            onOpen={() => onOpenBooking(segment.event)}
                        />
                    ) : (
                        <AvailableRoomSlot
                            key={`free-${segment.start.toISOString()}`}
                            segment={segment}
                            roomAvailable={roomAvailable}
                            onBook={onBook}
                        />
                    ),
                )}
            </div>
        </div>
    );
};
