import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { EventInput } from "@fullcalendar/core";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Monitor, Plus, Users } from "lucide-react";
import { z } from "zod";

import { BookingDialog, type BookingFormData } from "@/features/bookings/booking-dialog";
import { cancelBookingFn, createBookingFn, updateBookingFn } from "@/features/bookings/services/fns";
import { bookingCalendarQueryOptions, type BookingCalendarData } from "@/features/bookings/services/queries";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";
import { stripDefaultSearchParams } from "@/lib/router-search";

type BookingCalendarEvent = BookingCalendarData["events"][number];
type RoomDaySegment =
    | {
          type: "booking";
          start: Date;
          end: Date;
          event: BookingCalendarEvent;
      }
    | {
          type: "free";
          start: Date;
          end: Date;
      };

const roomSearchDefaults = {
    date: undefined as string | undefined,
    bookingId: undefined as string | undefined,
};

const roomSearchSchema = z.object({
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .catch(roomSearchDefaults.date),
    bookingId: z.string().uuid().optional().catch(roomSearchDefaults.bookingId),
});

export const Route = createFileRoute("/_bookings/rooms/$roomId")({
    validateSearch: roomSearchSchema,
    search: {
        middlewares: [stripDefaultSearchParams(roomSearchDefaults)],
    },
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(bookingCalendarQueryOptions()),
    component: RoomDayPage,
});

const padDatePart = (value: number) => value.toString().padStart(2, "0");

const formatDateKey = (date: Date) =>
    `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;

const parseDateKey = (value: string | undefined) => {
    if (!value) return startOfDay(new Date());

    const parts = value.split("-").map(Number);
    const year = parts[0] ?? NaN;
    const month = parts[1] ?? NaN;
    const day = parts[2] ?? NaN;
    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) return startOfDay(new Date());
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return startOfDay(new Date());
    }

    return startOfDay(date);
};

const startOfDay = (date: Date) => {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
};

const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const addMinutes = (date: Date, minutes: number) => {
    const next = new Date(date);
    next.setMinutes(next.getMinutes() + minutes, 0, 0);
    return next;
};

const maxDate = (a: Date, b: Date) => (a.getTime() > b.getTime() ? a : b);

const minDate = (a: Date, b: Date) => (a.getTime() < b.getTime() ? a : b);

const getDayBounds = (date: Date) => {
    const start = new Date(date);
    start.setHours(7, 0, 0, 0);
    const end = addDays(startOfDay(date), 1);
    return { start, end };
};

const roundUpToHalfHour = (date: Date) => {
    const next = new Date(date);
    next.setSeconds(0, 0);
    const minutes = next.getMinutes();
    const remainder = minutes % 30;

    if (remainder > 0) {
        next.setMinutes(minutes + (30 - remainder), 0, 0);
    }

    if (next.getTime() <= date.getTime()) {
        next.setMinutes(next.getMinutes() + 30, 0, 0);
    }

    return next;
};

const formatLongDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

const formatShortDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

const formatDuration = (start: Date, end: Date) => {
    const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
    return formatMinuteDuration(minutes);
};

const formatMinuteDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes} min`;
    if (remainingMinutes === 0) return `${hours} hr${hours === 1 ? "" : "s"}`;
    return `${hours} hr ${remainingMinutes} min`;
};

const getBookingEventInput = (event: BookingCalendarEvent): EventInput => ({
    id: event.id,
    resourceId: event.roomId,
    title: event.title,
    start: event.start,
    end: event.end,
    extendedProps: {
        resourceId: event.roomId,
        organizerId: event.organizer.id,
        organizer: event.organizer.name,
        organizerEmail: event.organizer.email,
        attendees: event.attendees.map((attendee) => attendee.name),
        attendeeIds: event.attendees.map((attendee) => attendee.id),
        description: event.description,
        canManage: event.canManage,
    },
});

const getRoomDayEvents = (events: BookingCalendarEvent[], roomId: string, dayStart: Date, dayEnd: Date) =>
    events
        .filter((event) => {
            if (event.roomId !== roomId) return false;
            const start = new Date(event.start);
            const end = new Date(event.end);
            return start < dayEnd && end > dayStart;
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

const getDaySegments = (events: BookingCalendarEvent[], dayStart: Date, dayEnd: Date) => {
    const segments: RoomDaySegment[] = [];
    let cursor = dayStart;

    for (const event of events) {
        const bookingStart = maxDate(new Date(event.start), dayStart);
        const bookingEnd = minDate(new Date(event.end), dayEnd);

        if (bookingStart.getTime() > cursor.getTime()) {
            segments.push({ type: "free", start: cursor, end: bookingStart });
        }

        if (bookingEnd.getTime() > bookingStart.getTime()) {
            segments.push({ type: "booking", start: bookingStart, end: bookingEnd, event });
        }

        if (bookingEnd.getTime() > cursor.getTime()) {
            cursor = bookingEnd;
        }
    }

    if (cursor.getTime() < dayEnd.getTime()) {
        segments.push({ type: "free", start: cursor, end: dayEnd });
    }

    return segments;
};

const getFirstBookableSlot = (segments: RoomDaySegment[], roomAvailable: boolean) => {
    if (!roomAvailable) return null;

    const nextStart = roundUpToHalfHour(new Date());

    for (const segment of segments) {
        if (segment.type !== "free") continue;

        const start = maxDate(segment.start, nextStart);
        const end = minDate(addMinutes(start, 60), segment.end);

        if (end.getTime() > start.getTime()) {
            return { start, end };
        }
    }

    return null;
};

const getBookableSlotForSegment = (segment: Extract<RoomDaySegment, { type: "free" }>) => {
    const start = maxDate(segment.start, roundUpToHalfHour(new Date()));
    const end = minDate(addMinutes(start, 60), segment.end);
    return end.getTime() > start.getTime() ? { start, end } : null;
};

const isPastEvent = (event: BookingCalendarEvent) => new Date(event.end).getTime() <= Date.now();

function RoomDayPage() {
    const { roomId } = Route.useParams();
    const { date, bookingId } = Route.useSearch();
    const selectedDate = parseDateKey(date);
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const room = data.rooms.find((item) => item.id === roomId);
    const queryClient = useQueryClient();
    const createBooking = useServerFn(createBookingFn);
    const updateBooking = useServerFn(updateBookingFn);
    const cancelBooking = useServerFn(cancelBookingFn);
    const navigate = useNavigate({ from: "/rooms/$roomId" });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "view">("create");
    const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
    const [prefill, setPrefill] = useState<{ roomId?: string; start?: Date; end?: Date }>({});

    const createBookingMutation = useMutation({
        mutationFn: createBooking,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: bookingCalendarQueryOptions().queryKey });
            await queryClient.invalidateQueries({ queryKey: notificationsQueryOptions().queryKey });
            setDialogOpen(false);
            clearSelectedBookingSearch();
        },
    });

    const updateBookingMutation = useMutation({
        mutationFn: updateBooking,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: bookingCalendarQueryOptions().queryKey });
            await queryClient.invalidateQueries({ queryKey: notificationsQueryOptions().queryKey });
            setDialogOpen(false);
            clearSelectedBookingSearch();
        },
    });

    const cancelBookingMutation = useMutation({
        mutationFn: cancelBooking,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: bookingCalendarQueryOptions().queryKey });
            await queryClient.invalidateQueries({ queryKey: notificationsQueryOptions().queryKey });
            setDialogOpen(false);
            clearSelectedBookingSearch();
        },
    });

    const clearSelectedBookingSearch = () => {
        if (!bookingId) return;
        navigate({
            search: (prev) => ({ ...prev, bookingId: undefined }),
            replace: true,
        });
    };

    const { start: dayStart, end: dayEnd } = getDayBounds(selectedDate);
    const dayEvents = room ? getRoomDayEvents(data.events, room.id, dayStart, dayEnd) : [];

    useEffect(() => {
        if (!bookingId || selectedEvent?.id === bookingId) return;

        const booking = dayEvents.find((event) => event.id === bookingId);
        if (!booking) return;

        setSelectedEvent(getBookingEventInput(booking));
        setDialogMode("view");
        createBookingMutation.reset();
        updateBookingMutation.reset();
        cancelBookingMutation.reset();
        setDialogOpen(true);
    }, [bookingId, cancelBookingMutation, createBookingMutation, dayEvents, selectedEvent?.id, updateBookingMutation]);

    if (!room) {
        return (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                <Link
                    to="/bookings"
                    className="inline-flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.24em] text-[var(--bone-dim)] uppercase no-underline transition-colors hover:text-[var(--bone)]"
                >
                    <ArrowLeft className="size-4" strokeWidth={1.4} />
                    <span>Calendar</span>
                </Link>
                <section className="border-y border-[var(--hairline)] py-12">
                    <p className="eyebrow eyebrow-gold">Room Details</p>
                    <h1 className="display-italic mt-3 text-4xl leading-none font-normal text-[var(--bone)]">
                        Room not found
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--bone-muted)]">
                        This room may have been removed or is no longer available in the booking system.
                    </p>
                </section>
            </div>
        );
    }

    const segments = getDaySegments(dayEvents, dayStart, dayEnd);
    const bookableSlot = getFirstBookableSlot(segments, room.available);
    const freeMinutes = segments.reduce(
        (total, segment) =>
            segment.type === "free"
                ? total + Math.max(0, segment.end.getTime() - segment.start.getTime()) / 60_000
                : total,
        0,
    );
    const liveEvent = dayEvents.find((event) => {
        const start = new Date(event.start).getTime();
        const end = new Date(event.end).getTime();
        const now = Date.now();
        return start <= now && now < end;
    });

    const goToDate = (nextDate: Date) => {
        navigate({
            search: (prev) => ({ ...prev, date: formatDateKey(nextDate), bookingId: undefined }),
            replace: true,
        });
    };

    const openBookingDialog = (slot: { start: Date; end: Date }) => {
        clearSelectedBookingSearch();
        setPrefill({ roomId: room.id, start: slot.start, end: slot.end });
        setSelectedEvent(null);
        setDialogMode("create");
        createBookingMutation.reset();
        updateBookingMutation.reset();
        cancelBookingMutation.reset();
        setDialogOpen(true);
    };

    const openEventDialog = (event: BookingCalendarEvent) => {
        navigate({
            search: (prev) => ({ ...prev, bookingId: event.id }),
        });
        setSelectedEvent(getBookingEventInput(event));
        setDialogMode("view");
        createBookingMutation.reset();
        updateBookingMutation.reset();
        cancelBookingMutation.reset();
        setDialogOpen(true);
    };

    const handleDialogOpenChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) clearSelectedBookingSearch();
    };

    const handleCreateBooking = (formData: BookingFormData) => {
        createBookingMutation.mutate({
            data: {
                title: formData.title,
                roomId: formData.roomId,
                startTime: formData.start.toISOString(),
                endTime: formData.end.toISOString(),
                attendeeIds: formData.attendeeIds,
                description: formData.description,
            },
        });
    };

    const handleUpdateBooking = (nextBookingId: string, formData: BookingFormData) => {
        updateBookingMutation.mutate({
            data: {
                bookingId: nextBookingId,
                title: formData.title,
                roomId: formData.roomId,
                startTime: formData.start.toISOString(),
                endTime: formData.end.toISOString(),
                attendeeIds: formData.attendeeIds,
                description: formData.description,
            },
        });
    };

    const handleCancelBooking = (nextBookingId: string, cancelReason: string) => {
        cancelBookingMutation.mutate({ data: { bookingId: nextBookingId, cancelReason } });
    };

    const createError = createBookingMutation.error instanceof Error ? createBookingMutation.error.message : null;
    const updateError = updateBookingMutation.error instanceof Error ? updateBookingMutation.error.message : null;
    const cancelError = cancelBookingMutation.error instanceof Error ? cancelBookingMutation.error.message : null;
    const selectedBooking = data.events.find((event) => event.id === selectedEvent?.id);
    const canManageSelectedEvent = dialogMode === "view" && selectedBooking?.canManage === true;

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    to="/bookings"
                    className="inline-flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.24em] text-[var(--bone-dim)] uppercase no-underline transition-colors hover:text-[var(--bone)]"
                >
                    <ArrowLeft className="size-4" strokeWidth={1.4} />
                    <span>Calendar</span>
                </Link>
                <Link
                    to="/my-bookings"
                    className="text-[0.66rem] font-semibold tracking-[0.24em] text-[var(--bone-dim)] uppercase no-underline transition-colors hover:text-[var(--bone)]"
                >
                    My Bookings
                </Link>
            </div>

            <header className="grid gap-6 border-b border-[var(--hairline)] pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="eyebrow eyebrow-gold">Room Day Detail</p>
                        <span
                            className={
                                room.available
                                    ? "inline-flex border border-[var(--signal)]/40 bg-[var(--signal)]/10 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-[var(--signal)] uppercase"
                                    : "inline-flex border border-red-300/40 bg-red-500/10 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-red-100 uppercase"
                            }
                        >
                            {room.available ? "Available" : "Unavailable"}
                        </span>
                    </div>
                    <h1 className="display-italic mt-3 text-4xl leading-none font-normal text-[var(--bone)] md:text-5xl">
                        {room.title}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--bone-muted)]">
                        {room.location} with capacity for {room.capacity} people. Today's ledger is scoped to this
                        room's reservations and open time.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => bookableSlot && openBookingDialog(bookableSlot)}
                    disabled={!bookableSlot}
                    className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 border border-[var(--bone)] bg-[var(--bone)] px-5 text-[0.66rem] font-semibold tracking-[0.24em] text-black uppercase transition-all hover:bg-white disabled:cursor-not-allowed disabled:border-[var(--hairline)] disabled:bg-transparent disabled:text-[var(--bone-dim)]"
                >
                    <Plus className="size-4" strokeWidth={1.7} />
                    <span>{bookableSlot ? "Book This Room" : "No Slots"}</span>
                </button>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <RoomStat
                    icon={<MapPin className="size-4" strokeWidth={1.4} />}
                    label="Location"
                    value={room.location}
                />
                <RoomStat
                    icon={<Users className="size-4" strokeWidth={1.4} />}
                    label="Capacity"
                    value={`${room.capacity} people`}
                />
                <RoomStat
                    icon={<Clock className="size-4" strokeWidth={1.4} />}
                    label="Free Today"
                    value={formatMinuteDuration(freeMinutes)}
                />
                <RoomStat
                    icon={<CalendarDays className="size-4" strokeWidth={1.4} />}
                    label="Bookings"
                    value={dayEvents.length}
                    accent={liveEvent ? "signal" : undefined}
                />
            </section>

            <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[var(--hairline)] py-4">
                        <div>
                            <p className="eyebrow eyebrow-gold">Schedule</p>
                            <h2 className="mt-1 text-xl font-semibold text-[var(--bone)]">
                                {formatLongDate(selectedDate)}
                            </h2>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => goToDate(addDays(selectedDate, -1))}
                                aria-label="Previous day"
                                className="flex size-9 cursor-pointer items-center justify-center border border-[var(--hairline)] text-[var(--bone-dim)] transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
                            >
                                <ChevronLeft className="size-4" strokeWidth={1.4} />
                            </button>
                            <button
                                type="button"
                                onClick={() => goToDate(startOfDay(new Date()))}
                                className="h-9 cursor-pointer border border-[var(--hairline)] px-4 text-[0.66rem] font-semibold tracking-[0.24em] text-[var(--bone-dim)] uppercase transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => goToDate(addDays(selectedDate, 1))}
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
                                <BookingSegment
                                    key={`booking-${segment.event.id}`}
                                    segment={segment}
                                    onOpen={() => openEventDialog(segment.event)}
                                />
                            ) : (
                                <FreeSegment
                                    key={`free-${segment.start.toISOString()}`}
                                    segment={segment}
                                    roomAvailable={room.available}
                                    onBook={() => {
                                        const slot = getBookableSlotForSegment(segment);
                                        if (slot) openBookingDialog(slot);
                                    }}
                                />
                            ),
                        )}
                    </div>
                </div>

                <aside className="space-y-7">
                    <section className="border-y border-[var(--hairline)] py-5">
                        <p className="eyebrow eyebrow-gold">Equipment</p>
                        {room.equipment.length === 0 ? (
                            <p className="mt-4 text-sm leading-6 text-[var(--bone-muted)]">
                                No equipment is assigned to this room yet.
                            </p>
                        ) : (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {room.equipment.map((item) => (
                                    <span
                                        key={item}
                                        className="inline-flex items-center gap-2 border border-[var(--hairline)] bg-[var(--surface-01)] px-3 py-1.5 text-xs text-[var(--bone-muted)]"
                                    >
                                        <Monitor className="size-3.5 text-[var(--gold)]" strokeWidth={1.4} />
                                        <span>{item}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="border-y border-[var(--hairline)] py-5">
                        <p className="eyebrow eyebrow-gold">Next Opening</p>
                        {bookableSlot ? (
                            <button
                                type="button"
                                onClick={() => openBookingDialog(bookableSlot)}
                                className="mt-4 block w-full cursor-pointer border border-[var(--hairline)] bg-[var(--surface-01)] p-4 text-left transition-colors hover:border-[var(--hairline-strong)] hover:bg-[var(--surface-02)]"
                            >
                                <span className="block text-sm font-semibold text-[var(--bone)]">
                                    {formatShortDate(bookableSlot.start)}
                                </span>
                                <span className="tabular-num mt-2 block text-xl text-[var(--gold)]">
                                    {formatTime(bookableSlot.start)} - {formatTime(bookableSlot.end)}
                                </span>
                                <span className="mt-2 block text-xs leading-5 text-[var(--bone-muted)]">
                                    Next available reservation window.
                                </span>
                            </button>
                        ) : (
                            <p className="mt-4 text-sm leading-6 text-[var(--bone-muted)]">
                                There are no future free slots on this day.
                            </p>
                        )}
                    </section>
                </aside>
            </section>

            <BookingDialog
                open={dialogOpen}
                onOpenChange={handleDialogOpenChange}
                mode={dialogMode}
                rooms={data.rooms}
                users={data.users}
                currentUserId={data.currentUserId}
                event={selectedEvent}
                prefill={prefill}
                onSubmit={handleCreateBooking}
                isSubmitting={createBookingMutation.isPending}
                error={dialogMode === "create" ? createError : null}
                canManage={canManageSelectedEvent}
                onUpdateBooking={handleUpdateBooking}
                isUpdating={updateBookingMutation.isPending}
                updateError={updateError}
                onCancelBooking={handleCancelBooking}
                isCancelling={cancelBookingMutation.isPending}
                cancelError={cancelError}
            />
        </div>
    );
}

const RoomStat = ({
    icon,
    label,
    value,
    accent,
}: {
    icon: ReactNode;
    label: string;
    value: number | string;
    accent?: "signal";
}) => (
    <div className="flex gap-3 border-y border-[var(--hairline)] py-4">
        <div className="flex size-9 shrink-0 items-center justify-center border border-[var(--hairline)] text-[var(--gold)]">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="eyebrow">{label}</p>
            <p
                className={`mt-1 truncate text-sm font-semibold ${
                    accent === "signal" ? "text-[var(--signal)]" : "text-[var(--bone)]"
                }`}
            >
                {value}
            </p>
        </div>
    </div>
);

const BookingSegment = ({
    segment,
    onOpen,
}: {
    segment: Extract<RoomDaySegment, { type: "booking" }>;
    onOpen: () => void;
}) => {
    const past = isPastEvent(segment.event);

    return (
        <button
            type="button"
            onClick={onOpen}
            className={`grid w-full cursor-pointer gap-3 border-t border-[var(--hairline)] px-1 py-4 text-left first:border-t-0 sm:grid-cols-[120px_1fr_auto] sm:items-center ${
                past ? "opacity-55" : "transition-colors hover:bg-[var(--surface-01)]"
            }`}
        >
            <div className="tabular-num text-[0.72rem] font-semibold tracking-[0.12em] text-[var(--gold)] uppercase">
                {formatTime(segment.start)} - {formatTime(segment.end)}
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

const FreeSegment = ({
    segment,
    roomAvailable,
    onBook,
}: {
    segment: Extract<RoomDaySegment, { type: "free" }>;
    roomAvailable: boolean;
    onBook: () => void;
}) => {
    const isPast = segment.end.getTime() <= Date.now();
    const canBook = roomAvailable && !isPast && !!getBookableSlotForSegment(segment);

    return (
        <div className="grid gap-3 border-t border-[var(--hairline)] px-1 py-4 first:border-t-0 sm:grid-cols-[120px_1fr_auto] sm:items-center">
            <div className="tabular-num text-[0.72rem] font-semibold tracking-[0.12em] text-[var(--bone-dim)] uppercase">
                {formatTime(segment.start)} - {formatTime(segment.end)}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--bone)]">Open</p>
                <p className="mt-1 text-xs text-[var(--bone-muted)]">{formatDuration(segment.start, segment.end)}</p>
            </div>
            <button
                type="button"
                onClick={onBook}
                disabled={!canBook}
                className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 border border-[var(--hairline)] px-3 text-[0.62rem] font-semibold tracking-[0.2em] text-[var(--bone-dim)] uppercase transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--hairline)] disabled:hover:text-[var(--bone-dim)]"
            >
                <Plus className="size-3.5" strokeWidth={1.6} />
                <span>Book</span>
            </button>
        </div>
    );
};
