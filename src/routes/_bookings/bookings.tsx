import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, DatesSetArg, EventClickArg, EventInput } from "@fullcalendar/core";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

import { BookingDialog, type BookingFormData } from "@/features/bookings/booking-dialog";

export const Route = createFileRoute("/_bookings/bookings")({ component: BookingsPage });

// ── Per-room accent palette — jewel tones on pure black ──
type RoomAccent = {
    hue: string;
    stripe: string;
    wash: string;
    washHover: string;
};

const ROOM_ACCENTS: Record<string, RoomAccent> = {
    "1": {
        hue: "Amber",
        stripe: "#e8c29a",
        wash: "rgba(232,194,154,0.06)",
        washHover: "rgba(232,194,154,0.12)",
    },
    "2": {
        hue: "Rust",
        stripe: "#b66a4a",
        wash: "rgba(182,106,74,0.07)",
        washHover: "rgba(182,106,74,0.14)",
    },
    "3": {
        hue: "Steel",
        stripe: "#7a8fa8",
        wash: "rgba(122,143,168,0.07)",
        washHover: "rgba(122,143,168,0.14)",
    },
    "4": {
        hue: "Sage",
        stripe: "#6a8a6e",
        wash: "rgba(106,138,110,0.07)",
        washHover: "rgba(106,138,110,0.14)",
    },
    "5": {
        hue: "Plum",
        stripe: "#8a6a8a",
        wash: "rgba(138,106,138,0.07)",
        washHover: "rgba(138,106,138,0.14)",
    },
};

// ── Mock data ──

const MOCK_ROOMS = [
    { id: "1", title: "Aurora", location: "3F East", capacity: 8, equipment: ["Projector", "Video Conferencing"] },
    { id: "2", title: "Horizon", location: "3F West", capacity: 12, equipment: ["TV Screen", "Whiteboard"] },
    { id: "3", title: "Nimbus", location: "4F East", capacity: 6, equipment: ["Video Conferencing", "Whiteboard"] },
    {
        id: "4",
        title: "Summit",
        location: "4F West",
        capacity: 20,
        equipment: ["Projector", "TV Screen", "Video Conferencing"],
    },
    { id: "5", title: "Cascade", location: "5F East", capacity: 4, equipment: ["Whiteboard"] },
];

function getTodayStr() {
    return new Date().toISOString().split("T")[0];
}

function makeMockEvents(): EventInput[] {
    const today = getTodayStr();
    return [
        {
            id: "e1",
            resourceId: "1",
            title: "Sprint Planning",
            start: `${today}T09:00:00`,
            end: `${today}T10:30:00`,
            extendedProps: {
                organizer: "Alice Chen",
                attendees: ["Bob", "Carol"],
                description: "Weekly sprint planning session",
            },
        },
        {
            id: "e2",
            resourceId: "2",
            title: "Design Review",
            start: `${today}T10:00:00`,
            end: `${today}T11:00:00`,
            extendedProps: {
                organizer: "David Kim",
                attendees: ["Eve", "Frank"],
                description: "Review new dashboard designs",
            },
        },
        {
            id: "e3",
            resourceId: "1",
            title: "1:1 with Manager",
            start: `${today}T13:00:00`,
            end: `${today}T13:30:00`,
            extendedProps: { organizer: "Grace Liu", attendees: ["Alice Chen"], description: "" },
        },
        {
            id: "e4",
            resourceId: "3",
            title: "API Workshop",
            start: `${today}T14:00:00`,
            end: `${today}T16:00:00`,
            extendedProps: {
                organizer: "Henry Wang",
                attendees: ["Ivan", "Julia", "Kevin"],
                description: "Hands-on REST API workshop",
            },
        },
        {
            id: "e5",
            resourceId: "4",
            title: "All Hands",
            start: `${today}T11:00:00`,
            end: `${today}T12:00:00`,
            extendedProps: { organizer: "CEO", attendees: ["All Staff"], description: "Monthly all-hands meeting" },
        },
        {
            id: "e6",
            resourceId: "5",
            title: "Quick Sync",
            start: `${today}T15:00:00`,
            end: `${today}T15:30:00`,
            extendedProps: { organizer: "Liam", attendees: ["Mia"], description: "" },
        },
    ];
}

const ALL_EQUIPMENT = ["Projector", "Video Conferencing", "Whiteboard", "TV Screen"];
const ALL_LOCATIONS = ["3F East", "3F West", "4F East", "4F West", "5F East"];

// ── View switcher ──

type ViewKey = "day" | "week" | "month" | "year";
const VIEW_MAP: Record<ViewKey, string> = {
    day: "resourceTimeGridDay",
    week: "timeGridWeek",
    month: "dayGridMonth",
    year: "multiMonthYear",
};

function computeTitle(view: ViewKey, date: Date): string {
    if (view === "day") {
        return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
    if (view === "week") {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay());
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
}

function BookingsPage() {
    const calendarRef = useRef<FullCalendar>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewKey>("day");
    const [viewContainsToday, setViewContainsToday] = useState(true);
    const [events, setEvents] = useState<EventInput[]>(makeMockEvents);

    const [showFilters, setShowFilters] = useState(false);
    const [capacityFilter, setCapacityFilter] = useState(0);
    const [equipmentFilter, setEquipmentFilter] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState<string[]>([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "view">("create");
    const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
    const [prefill, setPrefill] = useState<{ roomId?: string; start?: Date; end?: Date }>({});

    const filteredRooms = MOCK_ROOMS.filter((room) => {
        if (capacityFilter > 0 && room.capacity < capacityFilter) return false;
        if (equipmentFilter.length > 0 && !equipmentFilter.every((eq) => room.equipment.includes(eq))) return false;
        if (locationFilter.length > 0 && !locationFilter.includes(room.location)) return false;
        return true;
    });

    const resources = filteredRooms.map((room) => ({
        id: room.id,
        title: room.title,
        extendedProps: {
            location: room.location,
            capacity: room.capacity,
            equipment: room.equipment,
            accent: ROOM_ACCENTS[room.id],
        },
    }));

    const visibleEvents =
        view === "day" ? events : events.filter((e) => filteredRooms.some((r) => r.id === String(e.resourceId)));

    const hasActiveFilters = capacityFilter > 0 || equipmentFilter.length > 0 || locationFilter.length > 0;
    const activeFilterCount =
        (capacityFilter > 0 ? 1 : 0) + (equipmentFilter.length > 0 ? 1 : 0) + (locationFilter.length > 0 ? 1 : 0);

    const now = new Date();
    const liveBookings = events.filter((e) => {
        const start = typeof e.start === "string" ? new Date(e.start) : (e.start as Date | undefined);
        const end = typeof e.end === "string" ? new Date(e.end) : (e.end as Date | undefined);
        return !!start && !!end && start <= now && now < end;
    }).length;

    const goToday = () => calendarRef.current?.getApi().today();
    const goPrev = () => calendarRef.current?.getApi().prev();
    const goNext = () => calendarRef.current?.getApi().next();
    const changeView = (next: ViewKey) => {
        setView(next);
        calendarRef.current?.getApi().changeView(VIEW_MAP[next]);
    };

    const handleDatesSet = useCallback((arg: DatesSetArg) => {
        setCurrentDate(arg.view.currentStart);
        const today = new Date();
        setViewContainsToday(arg.view.activeStart <= today && today < arg.view.activeEnd);
    }, []);

    const handleSelect = useCallback((info: DateSelectArg) => {
        setPrefill({
            roomId: info.resource?.id,
            start: info.start,
            end: info.end,
        });
        setSelectedEvent(null);
        setDialogMode("create");
        setDialogOpen(true);
    }, []);

    const handleEventClick = useCallback((info: EventClickArg) => {
        const ev = info.event;
        setSelectedEvent({
            id: ev.id,
            title: ev.title,
            resourceId: ev.getResources()[0]?.id ?? String(ev.extendedProps?.resourceId ?? ""),
            start: ev.start?.toISOString(),
            end: ev.end?.toISOString(),
            extendedProps: ev.extendedProps,
        });
        setDialogMode("view");
        setDialogOpen(true);
    }, []);

    const handleCreateBooking = useCallback((data: BookingFormData) => {
        const newEvent: EventInput = {
            id: `e${Date.now()}`,
            resourceId: data.roomId,
            title: data.title,
            start: data.start.toISOString(),
            end: data.end.toISOString(),
            extendedProps: {
                organizer: "You",
                attendees: data.attendees,
                description: data.description,
            },
        };
        setEvents((prev) => [...prev, newEvent]);
        setDialogOpen(false);
    }, []);

    const toggleEquipment = (eq: string) =>
        setEquipmentFilter((prev) => (prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]));
    const toggleLocation = (loc: string) =>
        setLocationFilter((prev) => (prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]));
    const clearFilters = () => {
        setCapacityFilter(0);
        setEquipmentFilter([]);
        setLocationFilter([]);
    };

    const dateLabel = computeTitle(view, currentDate);
    const openNewBooking = () => {
        setPrefill({});
        setSelectedEvent(null);
        setDialogMode("create");
        setDialogOpen(true);
    };

    return (
        <div className="space-y-10">
            {/* ════════════════════════════════════════════
			    HEADER — editorial masthead
			════════════════════════════════════════════ */}
            <header className="relative" style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="eyebrow eyebrow-gold">Concierge &middot; Today</p>
                        <h1 className="mt-3 display-italic text-[clamp(2.4rem,4vw,3.5rem)] leading-[1] tracking-[-0.02em] text-[var(--bone)]">
                            Room Bookings
                        </h1>
                        <p className="mt-3 max-w-[52ch] text-[0.88rem] leading-relaxed text-[var(--bone-muted)]">
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

                    {/* Primary CTA — inverted bone button */}
                    <button
                        type="button"
                        onClick={openNewBooking}
                        className="group relative flex h-11 cursor-pointer items-center justify-center gap-3 self-start border border-[var(--bone)] bg-[var(--bone)] px-6 text-[0.68rem] font-semibold tracking-[0.3em] uppercase text-black transition-all duration-300 hover:bg-white hover:border-white hover:tracking-[0.34em]"
                    >
                        <Plus
                            className="size-4 transition-transform duration-300 group-hover:rotate-90"
                            strokeWidth={1.8}
                        />
                        <span>New Booking</span>
                    </button>
                </div>

                {/* Hairline rule */}
                <div aria-hidden className="mt-8 h-px w-full bg-[var(--hairline)]" />

                {/* Stats strip — editorial figures separated by hairline dividers */}
                <div className="mt-6 grid grid-cols-3 items-stretch divide-x divide-[var(--hairline)]">
                    <EditorialStat label="Bookings Today" value={events.length} />
                    <EditorialStat label="Rooms Shown" value={`${filteredRooms.length}/${MOCK_ROOMS.length}`} />
                    <EditorialStat
                        label="In Session"
                        value={liveBookings}
                        accent={liveBookings > 0 ? "signal" : undefined}
                    />
                </div>
            </header>

            {/* ════════════════════════════════════════════
			    TOOLBAR — editorial tab strip + date nav
			════════════════════════════════════════════ */}
            <div
                className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
                style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 200ms both" }}
            >
                {/* Date nav */}
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
                        className={`text-[0.66rem] font-semibold tracking-[0.28em] uppercase transition-colors ${
                            viewContainsToday
                                ? "text-[var(--gold)]"
                                : "cursor-pointer text-[var(--bone-dim)] hover:text-[var(--bone)]"
                        }`}
                    >
                        Today
                    </button>
                </div>

                {/* Right: View switcher + Filters */}
                <div className="flex items-center gap-8">
                    {/* View strip */}
                    <div className="flex items-stretch divide-x divide-[var(--hairline)]">
                        {(["day", "week", "month", "year"] as const).map((v) => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => changeView(v)}
                                className={`relative px-4 py-1 text-[0.66rem] font-semibold tracking-[0.28em] uppercase transition-colors ${
                                    view === v
                                        ? "text-[var(--bone)]"
                                        : "cursor-pointer text-[var(--bone-dim)] hover:text-[var(--bone-muted)]"
                                }`}
                            >
                                {v}
                                <span
                                    className={`pointer-events-none absolute bottom-0 left-2 right-2 h-px transition-all duration-300 ${
                                        view === v ? "bg-[var(--gold)]" : "bg-transparent"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Filter button */}
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

            {/* ════════════════════════════════════════════
			    ROOM LEGEND — hairline chips with jewel stripes
			════════════════════════════════════════════ */}
            <div
                className="flex flex-wrap items-center gap-3"
                style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 300ms both" }}
            >
                <span className="eyebrow">
                    {filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""}
                </span>
                <div aria-hidden className="h-3 w-px bg-[var(--hairline)]" />
                {filteredRooms.map((room) => {
                    const a = ROOM_ACCENTS[room.id];
                    return (
                        <div
                            key={room.id}
                            className="group relative flex items-center gap-3 border border-[var(--hairline)] bg-[var(--surface-01)] px-3 py-1.5 transition-colors hover:border-[var(--hairline-strong)]"
                        >
                            {/* Inset left stripe */}
                            <span
                                aria-hidden
                                className="absolute left-0 top-0 bottom-0 w-[2px]"
                                style={{ background: a.stripe }}
                            />
                            <div className="ml-1 flex items-baseline gap-2">
                                <span className="text-[0.76rem] font-medium text-[var(--bone)]">{room.title}</span>
                                <span className="tabular-num text-[0.62rem] text-[var(--bone-dim)]">
                                    {room.capacity}p &middot; {room.location}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ════════════════════════════════════════════
			    CALENDAR — hairline frame, no rounded card
			════════════════════════════════════════════ */}
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
                    slotMaxTime="22:00:00"
                    slotDuration="00:30:00"
                    slotLabelInterval="01:00:00"
                    allDaySlot={false}
                    selectable
                    selectMirror
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
                            <div className="flex items-center gap-3 py-2">
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
                            </div>
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
                    eventDidMount={(info) => {
                        const resourceId =
                            info.event.getResources()[0]?.id ?? String(info.event.extendedProps?.resourceId ?? "");
                        const accent = ROOM_ACCENTS[resourceId];
                        if (!accent) return;
                        info.el.style.setProperty("--accent-stripe", accent.stripe);
                        info.el.style.setProperty("--accent-wash", accent.wash);
                        info.el.style.setProperty("--accent-wash-hover", accent.washHover);
                    }}
                    datesSet={handleDatesSet}
                    select={handleSelect}
                    eventClick={handleEventClick}
                />
            </div>

            {/* Filter Drawer */}
            <FilterDrawer
                open={showFilters}
                onClose={() => setShowFilters(false)}
                capacityFilter={capacityFilter}
                equipmentFilter={equipmentFilter}
                locationFilter={locationFilter}
                setCapacityFilter={setCapacityFilter}
                toggleEquipment={toggleEquipment}
                toggleLocation={toggleLocation}
                clearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                roomsShown={filteredRooms.length}
                totalRooms={MOCK_ROOMS.length}
            />

            {/* Booking Dialog */}
            <BookingDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                mode={dialogMode}
                rooms={MOCK_ROOMS}
                event={selectedEvent}
                prefill={prefill}
                onSubmit={handleCreateBooking}
            />
        </div>
    );
}

// ════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════

function EditorialStat({ label, value, accent }: { label: string; value: number | string; accent?: "signal" }) {
    return (
        <div className="flex flex-col gap-2 py-2 pl-0 pr-4 first:pl-0 sm:pl-5 sm:first:pl-0">
            <span className="eyebrow">{label}</span>
            <div className="flex items-baseline gap-2">
                <span
                    className={`tabular-num text-[1.9rem] leading-none font-normal ${
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
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="border-t border-[var(--hairline)] pt-6 first:border-t-0 first:pt-0">
            <p className="eyebrow mb-4">{label}</p>
            <div className="flex flex-wrap gap-2">{children}</div>
        </div>
    );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
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
}

function FilterDrawer({
    open,
    onClose,
    capacityFilter,
    equipmentFilter,
    locationFilter,
    setCapacityFilter,
    toggleEquipment,
    toggleLocation,
    clearFilters,
    hasActiveFilters,
    roomsShown,
    totalRooms,
}: {
    open: boolean;
    onClose: () => void;
    capacityFilter: number;
    equipmentFilter: string[];
    locationFilter: string[];
    setCapacityFilter: (n: number) => void;
    toggleEquipment: (eq: string) => void;
    toggleLocation: (loc: string) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
    roomsShown: number;
    totalRooms: number;
}) {
    if (!open) return null;
    return (
        <>
            {/* Backdrop */}
            <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="fixed inset-0 z-[60] cursor-default bg-black/80 backdrop-blur-[2px]"
                style={{ animation: "fade-in 200ms ease both" }}
            />

            {/* Drawer */}
            <aside
                className="fixed top-0 right-0 z-[70] flex h-dvh w-full max-w-[400px] flex-col border-l border-[var(--hairline)] bg-[var(--surface-01)]"
                style={{ animation: "slide-in-right 350ms cubic-bezier(0.16,1,0.3,1) both" }}
            >
                {/* Header */}
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

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-8">
                    <div className="space-y-6">
                        <FilterGroup label="Minimum Capacity">
                            {[0, 4, 6, 8, 12, 20].map((n) => (
                                <Chip key={n} active={capacityFilter === n} onClick={() => setCapacityFilter(n)}>
                                    {n === 0 ? "Any" : `${n}+`}
                                </Chip>
                            ))}
                        </FilterGroup>

                        <FilterGroup label="Equipment">
                            {ALL_EQUIPMENT.map((eq) => (
                                <Chip
                                    key={eq}
                                    active={equipmentFilter.includes(eq)}
                                    onClick={() => toggleEquipment(eq)}
                                >
                                    {eq}
                                </Chip>
                            ))}
                        </FilterGroup>

                        <FilterGroup label="Location">
                            {ALL_LOCATIONS.map((loc) => (
                                <Chip
                                    key={loc}
                                    active={locationFilter.includes(loc)}
                                    onClick={() => toggleLocation(loc)}
                                >
                                    {loc}
                                </Chip>
                            ))}
                        </FilterGroup>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 border-t border-[var(--hairline)] px-8 py-5">
                    <button
                        type="button"
                        onClick={clearFilters}
                        disabled={!hasActiveFilters}
                        className="cursor-pointer px-3 py-2 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-[var(--bone-dim)] transition-colors hover:text-[var(--bone)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[var(--bone-dim)]"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="group flex flex-1 cursor-pointer items-center justify-center gap-2 border border-[var(--bone)] bg-[var(--bone)] py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-black transition-all hover:bg-white hover:tracking-[0.32em]"
                    >
                        <span>Show</span>
                        <span className="tabular-num tracking-normal">
                            {roomsShown} / {totalRooms}
                        </span>
                        <span>rooms</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
