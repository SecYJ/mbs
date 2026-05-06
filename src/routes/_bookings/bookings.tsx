import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, DatesSetArg, EventClickArg, EventInput } from "@fullcalendar/core";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { z } from "zod";

import { BookingDialog, type BookingFormData } from "@/features/bookings/booking-dialog";
import { cancelBookingFn, createBookingFn, updateBookingFn } from "@/features/bookings/services/fns";
import { bookingCalendarQueryOptions, type BookingCalendarData } from "@/features/bookings/services/queries";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";

type ViewKey = "day" | "week" | "month" | "year";
type RoomAccent = {
    hue: string;
    stripe: string;
    wash: string;
    washHover: string;
};
type FilterableRoom = {
    capacity: number;
    equipment: string[];
    location: string;
};
type BookingCalendarEvent = BookingCalendarData["events"][number];

const stringArraySearch = z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((value) => {
        if (!value) return [];
        return Array.isArray(value) ? value : [value];
    })
    .catch([]);

const bookingSearchDefaults = {
    capacity: 0,
    equipment: [] as string[],
    location: [] as string[],
};

const bookingSearchSchema = z.object({
    bookingId: z.string().uuid().optional().catch(undefined),
    capacity: z.number().default(bookingSearchDefaults.capacity).catch(bookingSearchDefaults.capacity),
    equipment: stringArraySearch.default(bookingSearchDefaults.equipment),
    location: stringArraySearch.default(bookingSearchDefaults.location),
});

export const Route = createFileRoute("/_bookings/bookings")({
    validateSearch: bookingSearchSchema,
    search: {
        middlewares: [stripSearchParams(bookingSearchDefaults)],
    },
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(bookingCalendarQueryOptions()),
    component: BookingsPage,
});

const ROOM_ACCENTS: RoomAccent[] = [
    {
        hue: "Amber",
        stripe: "#e8c29a",
        wash: "rgba(232,194,154,0.06)",
        washHover: "rgba(232,194,154,0.12)",
    },
    {
        hue: "Rust",
        stripe: "#b66a4a",
        wash: "rgba(182,106,74,0.07)",
        washHover: "rgba(182,106,74,0.14)",
    },
    {
        hue: "Steel",
        stripe: "#7a8fa8",
        wash: "rgba(122,143,168,0.07)",
        washHover: "rgba(122,143,168,0.14)",
    },
    {
        hue: "Sage",
        stripe: "#6a8a6e",
        wash: "rgba(106,138,110,0.07)",
        washHover: "rgba(106,138,110,0.14)",
    },
    {
        hue: "Plum",
        stripe: "#8a6a8a",
        wash: "rgba(138,106,138,0.07)",
        washHover: "rgba(138,106,138,0.14)",
    },
];

const VIEW_MAP: Record<ViewKey, string> = {
    day: "resourceTimeGridDay",
    week: "timeGridWeek",
    month: "dayGridMonth",
    year: "multiMonthYear",
};

const getAccent = (index: number) => ROOM_ACCENTS[index % ROOM_ACCENTS.length] ?? ROOM_ACCENTS[0];

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

const sortStrings = (values: string[]) => {
    const sorted: string[] = [];
    for (const value of values) {
        const index = sorted.findIndex((item) => value.localeCompare(item) < 0);
        if (index === -1) {
            sorted.push(value);
        } else {
            sorted.splice(index, 0, value);
        }
    }
    return sorted;
};

const computeTitle = (view: ViewKey, date: Date) => {
    if (view === "day") {
        return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
    if (view === "week") {
        const start = new Date(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const sameMonth = start.getMonth() === end.getMonth();
        const sameYear = start.getFullYear() === end.getFullYear();
        const startStr = start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            ...(sameYear ? {} : { year: "numeric" }),
        });
        const endStr = end.toLocaleDateString("en-US", {
            month: sameMonth ? undefined : "short",
            day: "numeric",
            year: "numeric",
        });
        return `${startStr} – ${endStr}`;
    }
    if (view === "year") {
        return String(date.getFullYear());
    }
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const formatTodayButtonDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

const getEventEndDate = (event: EventInput) => {
    if (!event.end) return null;
    return typeof event.end === "string" ? new Date(event.end) : (event.end as Date);
};

const isPastCalendarEvent = (event: EventInput, now = new Date()) => {
    const end = getEventEndDate(event);
    return !!end && end.getTime() <= now.getTime();
};

function BookingsPage() {
    const calendarRef = useRef<FullCalendar>(null);
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const queryClient = useQueryClient();
    const createBooking = useServerFn(createBookingFn);
    const updateBooking = useServerFn(updateBookingFn);
    const cancelBooking = useServerFn(cancelBookingFn);
    const navigate = useNavigate({ from: "/bookings" });
    const { bookingId, capacity, equipment, location } = Route.useSearch();

    const clearSelectedBookingSearch = () => {
        if (!bookingId) return;
        navigate({
            search: (prev) => ({ ...prev, bookingId: undefined }),
            replace: true,
        });
    };

    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewKey>("day");
    const [viewContainsToday, setViewContainsToday] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
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

    const cancelBookingMutation = useMutation({
        mutationFn: cancelBooking,
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

    const accentByRoomId: Record<string, RoomAccent> = {};
    data.rooms.forEach((room, index) => {
        accentByRoomId[room.id] = getAccent(index);
    });

    const allEquipment = sortStrings(Array.from(new Set(data.rooms.flatMap((room) => room.equipment))));
    const allLocations = sortStrings(Array.from(new Set(data.rooms.map((room) => room.location))));
    const filteredRooms = data.rooms.filter((room) => {
        if (capacity > 0 && room.capacity < capacity) return false;
        if (equipment.length > 0 && !equipment.every((item) => room.equipment.includes(item))) return false;
        if (location.length > 0 && !location.includes(room.location)) return false;
        return true;
    });

    const resources = filteredRooms.map((room) => ({
        id: room.id,
        title: room.title,
        extendedProps: {
            location: room.location,
            capacity: room.capacity,
            equipment: room.equipment,
            accent: accentByRoomId[room.id],
        },
    }));

    const events = data.events.map<EventInput>(getBookingEventInput);

    const visibleEvents =
        view === "day" ? events : events.filter((event) => filteredRooms.some((room) => room.id === event.resourceId));
    const hasActiveFilters = capacity > 0 || equipment.length > 0 || location.length > 0;
    const activeFilterCount = (capacity > 0 ? 1 : 0) + (equipment.length > 0 ? 1 : 0) + (location.length > 0 ? 1 : 0);
    const now = new Date();
    const liveBookings = events.filter((event) => {
        const start = typeof event.start === "string" ? new Date(event.start) : (event.start as Date | undefined);
        const end = typeof event.end === "string" ? new Date(event.end) : (event.end as Date | undefined);
        return !!start && !!end && start <= now && now < end;
    }).length;

    const goToday = () => calendarRef.current?.getApi().today();
    const goPrev = () => calendarRef.current?.getApi().prev();
    const goNext = () => calendarRef.current?.getApi().next();
    const changeView = (next: ViewKey) => {
        setView(next);
        calendarRef.current?.getApi().changeView(VIEW_MAP[next]);
    };
    const handleDatesSet = (arg: DatesSetArg) => {
        setCurrentDate(arg.view.currentStart);
        const today = new Date();
        setViewContainsToday(arg.view.activeStart <= today && today < arg.view.activeEnd);
    };
    const handleSelect = (info: DateSelectArg) => {
        if (info.start.getTime() <= Date.now()) {
            return;
        }

        clearSelectedBookingSearch();
        setPrefill({
            roomId: info.resource?.id,
            start: info.start,
            end: info.end,
        });
        setSelectedEvent(null);
        setDialogMode("create");
        createBookingMutation.reset();
        updateBookingMutation.reset();
        cancelBookingMutation.reset();
        setDialogOpen(true);
    };
    const handleEventClick = (info: EventClickArg) => {
        if (isPastCalendarEvent(info.event.toPlainObject())) {
            info.jsEvent.preventDefault();
            info.jsEvent.stopPropagation();
            return;
        }

        navigate({
            search: (prev) => ({ ...prev, bookingId: info.event.id }),
        });
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
    const handleCancelBooking = (nextBookingId: string, cancelReason: string) => {
        cancelBookingMutation.mutate({ data: { bookingId: nextBookingId, cancelReason } });
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
    const updateFilters = (next: Partial<typeof bookingSearchDefaults>) => {
        navigate({
            search: (prev) => ({ ...prev, ...next }),
            replace: true,
        });
    };
    const openNewBooking = () => {
        clearSelectedBookingSearch();
        setPrefill({});
        setSelectedEvent(null);
        setDialogMode("create");
        createBookingMutation.reset();
        updateBookingMutation.reset();
        cancelBookingMutation.reset();
        setDialogOpen(true);
    };
    const handleDialogOpenChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) clearSelectedBookingSearch();
    };

    useEffect(() => {
        if (!bookingId) return;

        const booking = data.events.find((event) => event.id === bookingId);
        if (!booking) return;

        if (new Date(booking.end).getTime() <= Date.now()) {
            clearSelectedBookingSearch();
            return;
        }

        calendarRef.current?.getApi().gotoDate(new Date(booking.start));
        setSelectedEvent(getBookingEventInput(booking));
        setDialogMode("view");
        createBookingMutation.reset();
        updateBookingMutation.reset();
        cancelBookingMutation.reset();
        setDialogOpen(true);
    }, [bookingId, data.events]);

    const dateLabel = computeTitle(view, currentDate);
    const todayButtonLabel = viewContainsToday ? `Today · ${formatTodayButtonDate(now)}` : dateLabel;
    const mutationError = createBookingMutation.error;
    const errorMessage = mutationError instanceof Error ? mutationError.message : null;
    const updateMutationError = updateBookingMutation.error;
    const updateErrorMessage = updateMutationError instanceof Error ? updateMutationError.message : null;
    const cancelMutationError = cancelBookingMutation.error;
    const cancelErrorMessage = cancelMutationError instanceof Error ? cancelMutationError.message : null;
    const selectedBooking = data.events.find((event) => event.id === selectedEvent?.id);
    const canManageSelectedEvent = dialogMode === "view" && selectedBooking?.canManage === true;

    return (
        <div className="space-y-6">
            <header
                className="relative border-b border-[var(--hairline)] pb-5"
                style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}
            >
                <div className="grid gap-5 xl:grid-cols-[minmax(240px,0.9fr)_minmax(460px,1.35fr)_auto] xl:items-center">
                    <div>
                        <p className="eyebrow eyebrow-gold">Concierge &middot; Today</p>
                        <h1 className="mt-2 display-italic text-[clamp(2rem,3vw,2.8rem)] leading-[1] tracking-[-0.02em] text-[var(--bone)]">
                            Room Bookings
                        </h1>
                        <p className="mt-2 max-w-[52ch] text-[0.82rem] leading-relaxed text-[var(--bone-muted)]">
                            {dateLabel}
                            {viewContainsToday && (
                                <span className="ml-3 inline-flex items-center gap-2 align-middle">
                                    <span
                                        className="inline-block size-1.5 rounded-full bg-[var(--signal)]"
                                        style={{ animation: "signal-pulse 2.4s ease-in-out infinite" }}
                                    />
                                    <span className="tabular-num text-[0.62rem] tracking-[0.3em] uppercase text-[var(--signal)]">
                                        Live
                                    </span>
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 items-stretch divide-x divide-[var(--hairline)] border-y border-[var(--hairline)] py-2 xl:border-y-0 xl:py-0">
                        <EditorialStat label="Bookings" value={events.length} />
                        <EditorialStat label="Rooms Shown" value={`${filteredRooms.length}/${data.rooms.length}`} />
                        <EditorialStat
                            label="In Session"
                            value={liveBookings}
                            accent={liveBookings > 0 ? "signal" : undefined}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={openNewBooking}
                        className="group relative flex h-11 cursor-pointer items-center justify-center gap-3 self-start border border-[var(--bone)] bg-[var(--bone)] px-6 text-[0.68rem] font-semibold tracking-[0.3em] uppercase text-black transition-all duration-300 hover:border-white hover:bg-white hover:tracking-[0.34em] xl:self-center"
                    >
                        <Plus
                            className="size-4 transition-transform duration-300 group-hover:rotate-90"
                            strokeWidth={1.8}
                        />
                        <span>New Booking</span>
                    </button>
                </div>
            </header>

            <div
                className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
                style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 200ms both" }}
            >
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={goPrev}
                            aria-label="Previous"
                            className="flex size-9 cursor-pointer items-center justify-center border border-[var(--hairline)] text-[var(--bone-dim)] transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
                        >
                            <ChevronLeft className="size-4" strokeWidth={1.4} />
                        </button>
                        <button
                            type="button"
                            onClick={goNext}
                            aria-label="Next"
                            className="flex size-9 cursor-pointer items-center justify-center border border-[var(--hairline)] text-[var(--bone-dim)] transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
                        >
                            <ChevronRight className="size-4" strokeWidth={1.4} />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={goToday}
                        aria-label="Go to today"
                        title="Go to today"
                        className={`text-[0.66rem] font-semibold tracking-[0.28em] uppercase transition-colors ${
                            viewContainsToday
                                ? "text-[var(--gold)]"
                                : "cursor-pointer text-[var(--bone-dim)] hover:text-[var(--bone)]"
                        }`}
                    >
                        {todayButtonLabel}
                    </button>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-stretch divide-x divide-[var(--hairline)]">
                        {(["day", "week", "month", "year"] as const).map((viewKey) => (
                            <button
                                key={viewKey}
                                type="button"
                                onClick={() => changeView(viewKey)}
                                className={`relative px-4 py-1 text-[0.66rem] font-semibold tracking-[0.28em] uppercase transition-colors ${
                                    view === viewKey
                                        ? "text-[var(--bone)]"
                                        : "cursor-pointer text-[var(--bone-dim)] hover:text-[var(--bone-muted)]"
                                }`}
                            >
                                {viewKey}
                                <span
                                    className={`pointer-events-none absolute right-2 bottom-0 left-2 h-px transition-all duration-300 ${
                                        view === viewKey ? "bg-[var(--gold)]" : "bg-transparent"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowFilters(true)}
                        className={`flex cursor-pointer items-center gap-3 border px-4 py-2 text-[0.66rem] font-semibold tracking-[0.28em] uppercase transition-all ${
                            hasActiveFilters
                                ? "border-[var(--gold)] text-[var(--gold)]"
                                : "border-[var(--hairline)] text-[var(--bone-dim)] hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
                        }`}
                    >
                        <span>Filters</span>
                        {hasActiveFilters && (
                            <span className="tabular-num inline-flex h-4 min-w-4 items-center justify-center border border-[var(--gold)] px-1 text-[0.58rem] tracking-normal text-[var(--gold)]">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div
                className="flex flex-wrap items-center gap-3"
                style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 300ms both" }}
            >
                <span className="eyebrow">
                    {filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""}
                </span>
                <div aria-hidden className="h-3 w-px bg-[var(--hairline)]" />
                {filteredRooms.map((room) => {
                    const accent = accentByRoomId[room.id];
                    return (
                        <Link
                            key={room.id}
                            to="/rooms/$roomId"
                            params={{ roomId: room.id }}
                            className="group relative flex items-center gap-3 border border-[var(--hairline)] bg-[var(--surface-01)] px-3 py-1.5 no-underline transition-colors hover:border-[var(--hairline-strong)]"
                        >
                            {accent && (
                                <span
                                    aria-hidden
                                    className="absolute top-0 bottom-0 left-0 w-[2px]"
                                    style={{ background: accent.stripe }}
                                />
                            )}
                            <div className="ml-1 flex items-baseline gap-2">
                                <span className="text-[0.76rem] font-medium text-[var(--bone)]">{room.title}</span>
                                <span className="tabular-num text-[0.62rem] text-[var(--bone-dim)]">
                                    {room.capacity}p &middot; {room.location}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div
                className="fc-dark-theme border-y border-[var(--hairline)] py-2"
                style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 400ms both" }}
            >
                <FullCalendar
                    ref={calendarRef}
                    plugins={[
                        resourceTimeGridPlugin,
                        timeGridPlugin,
                        dayGridPlugin,
                        multiMonthPlugin,
                        interactionPlugin,
                    ]}
                    initialView={VIEW_MAP[view]}
                    resources={resources}
                    events={visibleEvents}
                    headerToolbar={false}
                    height="auto"
                    firstDay={1}
                    slotMinTime="07:00:00"
                    slotMaxTime="24:00:00"
                    slotDuration="00:30:00"
                    slotLabelInterval="01:00:00"
                    allDaySlot={false}
                    selectable
                    selectMirror
                    selectAllow={(info) => info.start.getTime() > Date.now()}
                    editable={false}
                    nowIndicator
                    expandRows
                    dayMaxEvents={4}
                    slotLabelFormat={{
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }}
                    views={{
                        dayGridMonth: { dayHeaderFormat: { weekday: "short" } },
                        timeGridWeek: { dayHeaderFormat: { weekday: "short", day: "numeric" } },
                        multiMonthYear: { multiMonthMaxColumns: 3, multiMonthMinWidth: 200 },
                    }}
                    multiMonthMaxColumns={3}
                    multiMonthMinWidth={200}
                    resourceLabelContent={(arg) => {
                        const accent = (arg.resource.extendedProps as { accent?: RoomAccent }).accent;
                        return (
                            <Link
                                to="/rooms/$roomId"
                                params={{ roomId: arg.resource.id }}
                                className="flex items-center gap-3 py-2 no-underline"
                            >
                                {accent && (
                                    <span
                                        aria-hidden
                                        className="block h-8 w-[2px]"
                                        style={{ background: accent.stripe }}
                                    />
                                )}
                                <div className="flex flex-col gap-0.5 text-left">
                                    <span className="text-[0.82rem] font-medium tracking-[0.02em] text-[var(--bone)]">
                                        {arg.resource.title}
                                    </span>
                                    <span className="tabular-num text-[0.6rem] text-[var(--bone-dim)]">
                                        {arg.resource.extendedProps.location} &middot;{" "}
                                        {arg.resource.extendedProps.capacity}p
                                    </span>
                                </div>
                            </Link>
                        );
                    }}
                    eventContent={(arg) => (
                        <div className="flex h-full flex-col justify-center overflow-hidden px-2 py-1">
                            <span className="truncate text-[0.74rem] leading-tight font-medium text-[var(--bone)]">
                                {arg.event.title}
                            </span>
                            <span className="tabular-num truncate text-[0.6rem] leading-tight text-[var(--bone-dim)]">
                                {arg.timeText}
                            </span>
                        </div>
                    )}
                    eventClassNames={(info) =>
                        isPastCalendarEvent(info.event.toPlainObject()) ? ["booking-event-past"] : []
                    }
                    eventDidMount={(info) => {
                        const resourceId =
                            info.event.getResources()[0]?.id ?? String(info.event.extendedProps?.resourceId ?? "");
                        const accent = accentByRoomId[resourceId];
                        if (accent) {
                            info.el.style.setProperty("--accent-stripe", accent.stripe);
                            info.el.style.setProperty("--accent-wash", accent.wash);
                            info.el.style.setProperty("--accent-wash-hover", accent.washHover);
                        }
                        if (isPastCalendarEvent(info.event.toPlainObject())) {
                            info.el.setAttribute("aria-disabled", "true");
                            info.el.setAttribute("title", "Past booking");
                        }
                    }}
                    datesSet={handleDatesSet}
                    select={handleSelect}
                    eventClick={handleEventClick}
                />
            </div>

            <FilterDrawer
                open={showFilters}
                onClose={() => setShowFilters(false)}
                capacityFilter={capacity}
                equipmentFilter={equipment}
                locationFilter={location}
                onApplyFilters={updateFilters}
                rooms={data.rooms}
                totalRooms={data.rooms.length}
                allEquipment={allEquipment}
                allLocations={allLocations}
            />

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
                error={dialogMode === "create" ? errorMessage : null}
                canManage={canManageSelectedEvent}
                onUpdateBooking={handleUpdateBooking}
                isUpdating={updateBookingMutation.isPending}
                updateError={updateErrorMessage}
                onCancelBooking={handleCancelBooking}
                isCancelling={cancelBookingMutation.isPending}
                cancelError={cancelErrorMessage}
            />
        </div>
    );
}

const EditorialStat = ({ label, value, accent }: { label: string; value: number | string; accent?: "signal" }) => (
    <div className="flex flex-col gap-1.5 py-1 pr-4 pl-0 first:pl-0 sm:pl-5 sm:first:pl-0">
        <span className="eyebrow">{label}</span>
        <div className="flex items-baseline gap-2">
            <span
                className={`tabular-num text-[1.55rem] leading-none font-normal ${
                    accent === "signal" ? "text-[var(--signal)]" : "text-[var(--bone)]"
                }`}
            >
                {value}
            </span>
            {accent === "signal" && (
                <span
                    className="size-1.5 rounded-full bg-[var(--signal)]"
                    style={{ animation: "signal-pulse 2.4s ease-in-out infinite" }}
                />
            )}
        </div>
    </div>
);

const FilterGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="border-t border-[var(--hairline)] pt-6 first:border-t-0 first:pt-0">
        <p className="eyebrow mb-4">{label}</p>
        <div className="flex flex-wrap gap-2">{children}</div>
    </div>
);

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
        type="button"
        onClick={onClick}
        className={`cursor-pointer border px-3 py-1.5 text-[0.72rem] font-medium transition-all ${
            active
                ? "border-[var(--bone)] bg-[var(--bone)] text-black"
                : "border-[var(--hairline)] text-[var(--bone-muted)] hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
        }`}
    >
        {children}
    </button>
);

const FilterDrawer = ({
    open,
    onClose,
    capacityFilter,
    equipmentFilter,
    locationFilter,
    onApplyFilters,
    rooms,
    totalRooms,
    allEquipment,
    allLocations,
}: {
    open: boolean;
    onClose: () => void;
    capacityFilter: number;
    equipmentFilter: string[];
    locationFilter: string[];
    onApplyFilters: (next: Partial<typeof bookingSearchDefaults>) => void;
    rooms: FilterableRoom[];
    totalRooms: number;
    allEquipment: string[];
    allLocations: string[];
}) => {
    const [draftCapacity, setDraftCapacity] = useState(capacityFilter);
    const [draftEquipment, setDraftEquipment] = useState(equipmentFilter);
    const [draftLocation, setDraftLocation] = useState(locationFilter);

    useEffect(() => {
        if (!open) return;
        setDraftCapacity(capacityFilter);
        setDraftEquipment(equipmentFilter);
        setDraftLocation(locationFilter);
    }, [capacityFilter, equipmentFilter, locationFilter, open]);

    useEffect(() => {
        if (!open) return;

        const scrollY = window.scrollY;
        const previousBodyPosition = document.body.style.position;
        const previousBodyTop = document.body.style.top;
        const previousBodyWidth = document.body.style.width;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        document.documentElement.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        return () => {
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.body.style.position = previousBodyPosition;
            document.body.style.top = previousBodyTop;
            document.body.style.width = previousBodyWidth;
            window.scrollTo(0, scrollY);
        };
    }, [open]);

    const draftRoomsShown = rooms.filter((room) => {
        if (draftCapacity > 0 && room.capacity < draftCapacity) return false;
        if (draftEquipment.length > 0 && !draftEquipment.every((item) => room.equipment.includes(item))) return false;
        if (draftLocation.length > 0 && !draftLocation.includes(room.location)) return false;
        return true;
    }).length;
    const hasDraftFilters = draftCapacity > 0 || draftEquipment.length > 0 || draftLocation.length > 0;
    const toggleDraftEquipment = (item: string) => {
        setDraftEquipment((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]));
    };
    const toggleDraftLocation = (item: string) => {
        setDraftLocation((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]));
    };
    const clearDraftFilters = () => {
        setDraftCapacity(bookingSearchDefaults.capacity);
        setDraftEquipment(bookingSearchDefaults.equipment);
        setDraftLocation(bookingSearchDefaults.location);
    };
    const applyDraftFilters = () => {
        onApplyFilters({
            capacity: draftCapacity,
            equipment: draftEquipment,
            location: draftLocation,
        });
        onClose();
    };

    return (
        <>
            <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className={`fixed inset-0 z-[60] cursor-default bg-black/80 backdrop-blur-[2px] transition-opacity duration-200 ${
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
            />

            <aside
                aria-hidden={!open}
                className={`fixed top-0 right-0 z-[70] flex h-dvh w-full max-w-[400px] flex-col border-l border-[var(--hairline)] bg-[var(--surface-01)] transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    open ? "translate-x-0" : "pointer-events-none translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between border-b border-[var(--hairline)] px-8 py-7">
                    <div>
                        <p className="eyebrow eyebrow-gold">Refine</p>
                        <h3 className="mt-2 display-italic text-[1.7rem] leading-none text-[var(--bone)]">Filters</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex size-8 cursor-pointer items-center justify-center border border-transparent text-[var(--bone-dim)] transition-all hover:border-[var(--hairline)] hover:text-[var(--bone)]"
                    >
                        <X className="size-4" strokeWidth={1.4} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-8">
                    <div className="space-y-6">
                        <FilterGroup label="Minimum Capacity">
                            {[0, 4, 6, 8, 12, 20].map((n) => (
                                <Chip key={n} active={draftCapacity === n} onClick={() => setDraftCapacity(n)}>
                                    {n === 0 ? "Any" : `${n}+`}
                                </Chip>
                            ))}
                        </FilterGroup>

                        <FilterGroup label="Equipment">
                            {allEquipment.length === 0 ? (
                                <p className="text-[0.72rem] text-[var(--bone-dim)]">No equipment assigned yet.</p>
                            ) : (
                                allEquipment.map((item) => (
                                    <Chip
                                        key={item}
                                        active={draftEquipment.includes(item)}
                                        onClick={() => toggleDraftEquipment(item)}
                                    >
                                        {item}
                                    </Chip>
                                ))
                            )}
                        </FilterGroup>

                        <FilterGroup label="Location">
                            {allLocations.length === 0 ? (
                                <p className="text-[0.72rem] text-[var(--bone-dim)]">No locations available yet.</p>
                            ) : (
                                allLocations.map((item) => (
                                    <Chip
                                        key={item}
                                        active={draftLocation.includes(item)}
                                        onClick={() => toggleDraftLocation(item)}
                                    >
                                        {item}
                                    </Chip>
                                ))
                            )}
                        </FilterGroup>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t border-[var(--hairline)] px-8 py-5">
                    <button
                        type="button"
                        onClick={clearDraftFilters}
                        disabled={!hasDraftFilters}
                        className="cursor-pointer px-3 py-2 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-[var(--bone-dim)] transition-colors hover:text-[var(--bone)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[var(--bone-dim)]"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={applyDraftFilters}
                        className="group flex flex-1 cursor-pointer items-center justify-center gap-2 border border-[var(--bone)] bg-[var(--bone)] py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-black transition-all hover:bg-white hover:tracking-[0.32em]"
                    >
                        <span>Show</span>
                        <span className="tabular-num tracking-normal">
                            {draftRoomsShown} / {totalRooms}
                        </span>
                        <span>rooms</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
