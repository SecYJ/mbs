import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, DatesSetArg, EventClickArg, EventInput } from "@fullcalendar/core";
import {
	ChevronLeft,
	ChevronRight,
	Filter,
	Plus,
	MapPin,
	Users,
	Monitor,
	X,
	Sparkles,
	CalendarDays,
	Activity,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BookingDialog, type BookingFormData } from "@/features/bookings/booking-dialog";

export const Route = createFileRoute("/_app/bookings")({ component: BookingsPage });

// ── Per-room accent palette ──
// Each room gets a distinct hue so events become visually scannable instead of
// a wall of teal. Hues are chosen to harmonize on the dark background.
type RoomAccent = {
	hue: string;
	stripe: string;
	wash: string;
	washHover: string;
	glow: string;
	dot: string;
};

const ROOM_ACCENTS: Record<string, RoomAccent> = {
	"1": { hue: "Aurora", stripe: "#2dd4bf", wash: "rgba(45,212,191,0.16)", washHover: "rgba(45,212,191,0.26)", glow: "rgba(45,212,191,0.4)", dot: "#5eead4" },
	"2": { hue: "Amber", stripe: "#f59e0b", wash: "rgba(251,191,36,0.15)", washHover: "rgba(251,191,36,0.25)", glow: "rgba(251,191,36,0.4)", dot: "#fbbf24" },
	"3": { hue: "Violet", stripe: "#a855f7", wash: "rgba(192,132,252,0.16)", washHover: "rgba(192,132,252,0.26)", glow: "rgba(192,132,252,0.4)", dot: "#c084fc" },
	"4": { hue: "Sky", stripe: "#38bdf8", wash: "rgba(125,211,252,0.16)", washHover: "rgba(125,211,252,0.26)", glow: "rgba(125,211,252,0.4)", dot: "#7dd3fc" },
	"5": { hue: "Rose", stripe: "#fb7185", wash: "rgba(253,164,175,0.15)", washHover: "rgba(253,164,175,0.25)", glow: "rgba(253,164,175,0.4)", dot: "#fda4af" },
};

const FILTER_THEMES = {
	capacity: "#5eead4",
	equipment: "#c084fc",
	location: "#fbbf24",
} as const;

// ── Mock data ──

const MOCK_ROOMS = [
	{ id: "1", title: "Aurora", location: "3F East", capacity: 8, equipment: ["Projector", "Video Conferencing"] },
	{ id: "2", title: "Horizon", location: "3F West", capacity: 12, equipment: ["TV Screen", "Whiteboard"] },
	{ id: "3", title: "Nimbus", location: "4F East", capacity: 6, equipment: ["Video Conferencing", "Whiteboard"] },
	{ id: "4", title: "Summit", location: "4F West", capacity: 20, equipment: ["Projector", "TV Screen", "Video Conferencing"] },
	{ id: "5", title: "Cascade", location: "5F East", capacity: 4, equipment: ["Whiteboard"] },
];

function getTodayStr() {
	return new Date().toISOString().split("T")[0];
}

function makeMockEvents(): EventInput[] {
	const today = getTodayStr();
	return [
		{ id: "e1", resourceId: "1", title: "Sprint Planning", start: `${today}T09:00:00`, end: `${today}T10:30:00`, extendedProps: { organizer: "Alice Chen", attendees: ["Bob", "Carol"], description: "Weekly sprint planning session" } },
		{ id: "e2", resourceId: "2", title: "Design Review", start: `${today}T10:00:00`, end: `${today}T11:00:00`, extendedProps: { organizer: "David Kim", attendees: ["Eve", "Frank"], description: "Review new dashboard designs" } },
		{ id: "e3", resourceId: "1", title: "1:1 with Manager", start: `${today}T13:00:00`, end: `${today}T13:30:00`, extendedProps: { organizer: "Grace Liu", attendees: ["Alice Chen"], description: "" } },
		{ id: "e4", resourceId: "3", title: "API Workshop", start: `${today}T14:00:00`, end: `${today}T16:00:00`, extendedProps: { organizer: "Henry Wang", attendees: ["Ivan", "Julia", "Kevin"], description: "Hands-on REST API workshop" } },
		{ id: "e5", resourceId: "4", title: "All Hands", start: `${today}T11:00:00`, end: `${today}T12:00:00`, extendedProps: { organizer: "CEO", attendees: ["All Staff"], description: "Monthly all-hands meeting" } },
		{ id: "e6", resourceId: "5", title: "Quick Sync", start: `${today}T15:00:00`, end: `${today}T15:30:00`, extendedProps: { organizer: "Liam", attendees: ["Mia"], description: "" } },
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
		view === "day"
			? events
			: events.filter((e) => filteredRooms.some((r) => r.id === String(e.resourceId)));

	const hasActiveFilters = capacityFilter > 0 || equipmentFilter.length > 0 || locationFilter.length > 0;
	const activeFilterCount =
		(capacityFilter > 0 ? 1 : 0) + (equipmentFilter.length > 0 ? 1 : 0) + (locationFilter.length > 0 ? 1 : 0);

	const now = new Date();
	const liveBookings = events.filter((e) => {
		const start = typeof e.start === "string" ? new Date(e.start) : (e.start as Date | undefined);
		const end = typeof e.end === "string" ? new Date(e.end) : (e.end as Date | undefined);
		return !!start && !!end && start <= now && now < end;
	}).length;

	// Navigation
	const goToday = () => {
		calendarRef.current?.getApi().today();
	};
	const goPrev = () => {
		calendarRef.current?.getApi().prev();
	};
	const goNext = () => {
		calendarRef.current?.getApi().next();
	};
	const changeView = (next: ViewKey) => {
		setView(next);
		calendarRef.current?.getApi().changeView(VIEW_MAP[next]);
	};

	const handleDatesSet = useCallback((arg: DatesSetArg) => {
		setCurrentDate(arg.view.currentStart);
		const today = new Date();
		setViewContainsToday(arg.view.activeStart <= today && today < arg.view.activeEnd);
	}, []);

	// Calendar interaction
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

	// Filter toggles
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

	return (
		<div className="space-y-7">
			{/* Hero — single-row command bar */}
			<header
				className="relative overflow-hidden rounded-2xl border border-[rgba(141,229,219,0.08)] bg-[rgba(10,22,26,0.55)] px-6 py-4 backdrop-blur-sm sm:px-7"
				style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}
			>
				{/* Aurora glow accents (subtle) */}
				<div
					aria-hidden
					className="pointer-events-none absolute -top-32 -left-24 size-[280px] rounded-full opacity-50"
					style={{ background: "radial-gradient(circle, rgba(94,234,212,0.18) 0%, transparent 65%)" }}
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute -right-24 -bottom-32 size-[300px] rounded-full opacity-40"
					style={{ background: "radial-gradient(circle, rgba(192,132,252,0.16) 0%, transparent 65%)" }}
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute -top-16 left-1/2 size-[240px] rounded-full opacity-30"
					style={{ background: "radial-gradient(circle, rgba(125,211,252,0.14) 0%, transparent 65%)" }}
				/>

				<div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
					{/* Title block */}
					<div className="flex items-center justify-between gap-3">
						<div className="min-w-0">
							<span
								className="inline-flex items-center gap-1.5 bg-clip-text text-[0.6rem] font-bold tracking-[0.2em] text-transparent uppercase"
								style={{
									backgroundImage:
										"linear-gradient(90deg, #5eead4 0%, #c084fc 55%, #fda4af 100%)",
								}}
							>
								<Sparkles className="size-3 text-[#60d7cf]" strokeWidth={2} />
								Workspace
							</span>
							<h1 className="mt-0.5 font-['Fraunces'] text-[1.5rem] leading-tight font-normal italic text-[#e8dfd4] sm:text-[1.7rem]">
								Room{" "}
								<span className="bg-gradient-to-r from-[#8de5db] via-[#c084fc] to-[#fda4af] bg-clip-text text-transparent">
									Bookings
								</span>
							</h1>
						</div>
						{/* Mobile-only action */}
						<Button
							onClick={() => {
								setPrefill({});
								setSelectedEvent(null);
								setDialogMode("create");
								setDialogOpen(true);
							}}
							aria-label="New booking"
							className="size-10 shrink-0 cursor-pointer rounded-lg p-0 text-[#0a1418] shadow-[0_6px_20px_rgba(94,234,212,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(94,234,212,0.4)] lg:hidden"
							style={{ background: "linear-gradient(135deg, #5eead4 0%, #2dd4bf 50%, #0d9488 100%)" }}
						>
							<Plus className="size-4" strokeWidth={2.4} />
						</Button>
					</div>

					{/* Stats — inline divider strip */}
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:ml-auto lg:flex-nowrap lg:rounded-xl lg:border lg:border-[rgba(141,229,219,0.08)] lg:bg-[rgba(7,19,22,0.4)] lg:px-5 lg:py-2">
						<Stat
							label="Today"
							value={events.length}
							accent="#5eead4"
							icon={<CalendarDays className="size-3.5" strokeWidth={1.7} />}
						/>
						<span aria-hidden className="hidden h-7 w-px bg-[rgba(141,229,219,0.1)] lg:block" />
						<Stat
							label="Rooms"
							value={`${filteredRooms.length}/${MOCK_ROOMS.length}`}
							accent="#c084fc"
							icon={<MapPin className="size-3.5" strokeWidth={1.7} />}
						/>
						<span aria-hidden className="hidden h-7 w-px bg-[rgba(141,229,219,0.1)] lg:block" />
						<Stat
							label="Live"
							value={liveBookings}
							accent="#fbbf24"
							pulse
							icon={<Activity className="size-3.5" strokeWidth={1.7} />}
						/>
					</div>

					{/* Desktop action */}
					<Button
						onClick={() => {
							setPrefill({});
							setSelectedEvent(null);
							setDialogMode("create");
							setDialogOpen(true);
						}}
						className="hidden h-10 cursor-pointer gap-2 rounded-lg px-4 text-[0.74rem] font-semibold tracking-[0.04em] uppercase text-[#0a1418] shadow-[0_6px_20px_rgba(94,234,212,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(94,234,212,0.4)] lg:flex"
						style={{ background: "linear-gradient(135deg, #5eead4 0%, #2dd4bf 50%, #0d9488 100%)" }}
					>
						<Plus className="size-4" strokeWidth={2.4} />
						New Booking
					</Button>
				</div>
			</header>

			{/* Toolbar: Date Nav + View Switcher + Filters */}
			<div
				className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
				style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 200ms both" }}
			>
				{/* Date Navigation */}
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-0.5 rounded-xl border border-[rgba(141,229,219,0.1)] bg-[rgba(12,27,31,0.6)] p-1 backdrop-blur-sm">
						<button
							type="button"
							onClick={goPrev}
							aria-label="Previous"
							className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-[#6a9590] transition-all hover:bg-[rgba(94,234,212,0.1)] hover:text-[#5eead4]"
						>
							<ChevronLeft className="size-4" />
						</button>
						<button
							type="button"
							onClick={goToday}
							className={`rounded-lg px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.06em] uppercase transition-all ${
								viewContainsToday
									? "bg-gradient-to-br from-[rgba(94,234,212,0.18)] to-[rgba(192,132,252,0.12)] text-[#8de5db] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
									: "cursor-pointer text-[#6a9590] hover:bg-[rgba(94,234,212,0.06)] hover:text-[#8de5db]"
							}`}
						>
							Today
						</button>
						<button
							type="button"
							onClick={goNext}
							aria-label="Next"
							className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-[#6a9590] transition-all hover:bg-[rgba(94,234,212,0.1)] hover:text-[#5eead4]"
						>
							<ChevronRight className="size-4" />
						</button>
					</div>

					<div className="flex items-baseline gap-2">
						<h2 className="text-[1rem] font-semibold text-[#e8dfd4]">{dateLabel}</h2>
						{viewContainsToday && (
							<span className="rounded-full bg-[rgba(94,234,212,0.12)] px-2 py-0.5 text-[0.6rem] font-bold tracking-wider text-[#5eead4] uppercase">
								Live
							</span>
						)}
					</div>
				</div>

				{/* Right: View switcher + Filters */}
				<div className="flex items-center gap-3">
					{/* View switcher pill */}
					<div className="flex items-center gap-0.5 rounded-xl border border-[rgba(141,229,219,0.1)] bg-[rgba(12,27,31,0.6)] p-1 backdrop-blur-sm">
						{(["day", "week", "month", "year"] as const).map((v) => (
							<button
								key={v}
								type="button"
								onClick={() => changeView(v)}
								className={`rounded-lg px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.06em] uppercase transition-all ${
									view === v
										? "bg-gradient-to-br from-[rgba(94,234,212,0.18)] to-[rgba(192,132,252,0.12)] text-[#8de5db] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
										: "cursor-pointer text-[#6a9590] hover:bg-[rgba(94,234,212,0.06)] hover:text-[#8de5db]"
								}`}
							>
								{v}
							</button>
						))}
					</div>

					{/* Filter Toggle */}
					<button
						type="button"
						onClick={() => setShowFilters(true)}
						className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-[0.78rem] font-medium backdrop-blur-sm transition-all ${
							hasActiveFilters
								? "border-[rgba(94,234,212,0.25)] bg-[rgba(94,234,212,0.1)] text-[#5eead4]"
								: "border-[rgba(141,229,219,0.1)] bg-[rgba(12,27,31,0.6)] text-[#6a9590] hover:border-[rgba(94,234,212,0.2)] hover:bg-[rgba(94,234,212,0.06)] hover:text-[#8de5db]"
						}`}
					>
						<Filter className="size-4" strokeWidth={1.6} />
						Filters
						{hasActiveFilters && (
							<span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-[#5eead4] to-[#0d9488] text-[0.65rem] font-bold text-[#071316] shadow-[0_0_10px_rgba(94,234,212,0.4)]">
								{activeFilterCount}
							</span>
						)}
					</button>
				</div>
			</div>

			{/* Room Legend */}
			<div
				className="flex flex-wrap items-center gap-2.5"
				style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 300ms both" }}
			>
				<span className="text-[0.7rem] font-medium tracking-[0.04em] text-[#5a7e79] uppercase">
					{filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""}
				</span>
				{filteredRooms.map((room) => {
					const a = ROOM_ACCENTS[room.id];
					return (
						<div
							key={room.id}
							className="flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] backdrop-blur-sm"
							style={{
								borderColor: `${a.stripe}33`,
								background: `linear-gradient(135deg, ${a.stripe}14 0%, rgba(7,19,22,0.4) 100%)`,
							}}
						>
							<span
								className="size-1.5 rounded-full"
								style={{ background: a.dot, boxShadow: `0 0 8px ${a.glow}` }}
							/>
							<span className="font-semibold text-[#e8dfd4]">{room.title}</span>
							<span className="text-[#6a9590]">
								{room.capacity}p · {room.location}
							</span>
						</div>
					);
				})}
			</div>

			{/* Calendar */}
			<div
				className="fc-dark-theme rounded-2xl border border-[rgba(141,229,219,0.08)] bg-[rgba(12,27,31,0.5)] p-1 backdrop-blur-sm"
				style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 350ms both" }}
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
						dayGridMonth: {
							dayHeaderFormat: { weekday: "short" },
						},
						timeGridWeek: {
							dayHeaderFormat: { weekday: "short", day: "numeric" },
						},
						multiMonthYear: {
							multiMonthMaxColumns: 3,
							multiMonthMinWidth: 200,
						},
					}}
					multiMonthMaxColumns={3}
					multiMonthMinWidth={200}
					resourceLabelContent={(arg) => {
						const accent = (arg.resource.extendedProps as { accent?: RoomAccent }).accent;
						return (
							<div className="flex items-center gap-2.5 py-1">
								{accent && (
									<span
										className="block h-7 w-[3px] rounded-full"
										style={{
											background: `linear-gradient(180deg, ${accent.stripe}, ${accent.dot})`,
											boxShadow: `0 0 10px ${accent.glow}`,
										}}
									/>
								)}
								<div className="flex flex-col gap-0.5 text-left">
									<span className="text-[0.82rem] font-semibold text-[#e8dfd4]">
										{arg.resource.title}
									</span>
									<span className="text-[0.65rem] text-[#5a7e79]">
										{arg.resource.extendedProps.location} · {arg.resource.extendedProps.capacity}p
									</span>
								</div>
							</div>
						);
					}}
					eventContent={(arg) => (
						<div className="flex h-full flex-col justify-center overflow-hidden px-2 py-1">
							<span className="truncate text-[0.74rem] leading-tight font-semibold text-[#e8dfd4]">
								{arg.event.title}
							</span>
							<span className="truncate text-[0.65rem] leading-tight text-[rgba(232,223,212,0.55)]">
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
						info.el.style.setProperty("--accent-glow", accent.glow);
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

// ── Sub-components ──

function Stat({
	label,
	value,
	accent,
	icon,
	pulse,
}: {
	label: string;
	value: number | string;
	accent: string;
	icon: React.ReactNode;
	pulse?: boolean;
}) {
	return (
		<div className="flex items-center gap-2">
			<span
				className="flex size-7 items-center justify-center rounded-md"
				style={{
					background: `linear-gradient(135deg, ${accent}26 0%, ${accent}10 100%)`,
					boxShadow: `inset 0 0 0 1px ${accent}38`,
					color: accent,
				}}
			>
				{icon}
			</span>
			<div className="flex items-baseline gap-1.5 leading-tight">
				<span className="text-[0.95rem] font-semibold text-[#e8dfd4] tabular-nums">{value}</span>
				<span className="text-[0.62rem] font-semibold tracking-[0.1em] text-[#5a7e79] uppercase">
					{label}
				</span>
				{pulse && (
					<span
						className="size-1.5 rounded-full"
						style={{
							background: accent,
							boxShadow: `0 0 8px ${accent}`,
							animation: "glow-pulse 2.4s ease-in-out infinite",
						}}
					/>
				)}
			</div>
		</div>
	);
}

function FilterGroup({
	icon: Icon,
	label,
	accent,
	children,
}: {
	icon: typeof Users;
	label: string;
	accent: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<div className="mb-3 flex items-center gap-2">
				<span
					className="flex size-6 items-center justify-center rounded-md"
					style={{
						background: `${accent}1c`,
						boxShadow: `inset 0 0 0 1px ${accent}38`,
						color: accent,
					}}
				>
					<Icon className="size-3.5" strokeWidth={1.8} />
				</span>
				<span className="text-[0.7rem] font-semibold tracking-[0.08em] text-[#7da39d] uppercase">
					{label}
				</span>
			</div>
			<div className="flex flex-wrap gap-1.5">{children}</div>
		</div>
	);
}

function Chip({
	active,
	accent,
	onClick,
	children,
}: {
	active: boolean;
	accent: string;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="cursor-pointer rounded-md px-2.5 py-1 text-[0.72rem] font-medium transition-all"
			style={
				active
					? {
							background: `linear-gradient(135deg, ${accent}28, ${accent}14)`,
							boxShadow: `inset 0 0 0 1px ${accent}55, 0 4px 14px ${accent}1f`,
							color: accent,
						}
					: {
							color: "#6a9590",
						}
			}
			onMouseEnter={(e) => {
				if (active) return;
				e.currentTarget.style.background = `${accent}10`;
				e.currentTarget.style.color = "#e8dfd4";
			}}
			onMouseLeave={(e) => {
				if (active) return;
				e.currentTarget.style.background = "transparent";
				e.currentTarget.style.color = "#6a9590";
			}}
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
				className="fixed inset-0 z-[60] cursor-default bg-[rgba(7,19,22,0.55)] backdrop-blur-[2px]"
				style={{ animation: "fade-in 200ms ease both" }}
			/>

			{/* Drawer */}
			<aside
				className="fixed top-0 right-0 z-[70] flex h-dvh w-full max-w-[380px] flex-col border-l border-[rgba(141,229,219,0.1)] bg-[rgba(10,20,24,0.96)] shadow-[-30px_0_60px_rgba(0,0,0,0.4)] backdrop-blur-xl"
				style={{ animation: "slide-in-right 350ms cubic-bezier(0.16,1,0.3,1) both" }}
			>
				{/* Drawer aurora glow */}
				<div
					aria-hidden
					className="pointer-events-none absolute -top-24 -right-16 size-[280px] rounded-full opacity-40"
					style={{ background: "radial-gradient(circle, rgba(192,132,252,0.18) 0%, transparent 65%)" }}
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute -bottom-24 -left-16 size-[260px] rounded-full opacity-40"
					style={{ background: "radial-gradient(circle, rgba(94,234,212,0.16) 0%, transparent 65%)" }}
				/>

				{/* Header */}
				<div className="relative z-10 flex items-start justify-between border-b border-[rgba(141,229,219,0.08)] px-6 py-5">
					<div>
						<span
							className="bg-clip-text text-[0.66rem] font-bold tracking-[0.18em] text-transparent uppercase"
							style={{ backgroundImage: "linear-gradient(90deg, #5eead4 0%, #c084fc 100%)" }}
						>
							Refine
						</span>
						<h3 className="mt-1 font-['Fraunces'] text-[1.5rem] font-normal italic text-[#e8dfd4]">
							Filters
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-[#6a9590] transition-all hover:bg-[rgba(94,234,212,0.08)] hover:text-[#8de5db]"
					>
						<X className="size-4" />
					</button>
				</div>

				{/* Body */}
				<div className="relative z-10 flex-1 overflow-y-auto px-6 py-6">
					<div className="space-y-7">
						<FilterGroup icon={Users} label="Min. Capacity" accent={FILTER_THEMES.capacity}>
							{[0, 4, 6, 8, 12, 20].map((n) => (
								<Chip
									key={n}
									active={capacityFilter === n}
									accent={FILTER_THEMES.capacity}
									onClick={() => setCapacityFilter(n)}
								>
									{n === 0 ? "Any" : `${n}+`}
								</Chip>
							))}
						</FilterGroup>

						<FilterGroup icon={Monitor} label="Equipment" accent={FILTER_THEMES.equipment}>
							{ALL_EQUIPMENT.map((eq) => (
								<Chip
									key={eq}
									active={equipmentFilter.includes(eq)}
									accent={FILTER_THEMES.equipment}
									onClick={() => toggleEquipment(eq)}
								>
									{eq}
								</Chip>
							))}
						</FilterGroup>

						<FilterGroup icon={MapPin} label="Location" accent={FILTER_THEMES.location}>
							{ALL_LOCATIONS.map((loc) => (
								<Chip
									key={loc}
									active={locationFilter.includes(loc)}
									accent={FILTER_THEMES.location}
									onClick={() => toggleLocation(loc)}
								>
									{loc}
								</Chip>
							))}
						</FilterGroup>
					</div>
				</div>

				{/* Footer */}
				<div className="relative z-10 flex items-center gap-3 border-t border-[rgba(141,229,219,0.08)] px-6 py-4">
					<button
						type="button"
						onClick={clearFilters}
						disabled={!hasActiveFilters}
						className="cursor-pointer rounded-lg px-4 py-2 text-[0.72rem] font-semibold tracking-[0.06em] uppercase text-[#6a9590] transition-all hover:bg-[rgba(94,234,212,0.06)] hover:text-[#8de5db] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#6a9590]"
					>
						Reset
					</button>
					<Button
						onClick={onClose}
						className="flex-1 cursor-pointer text-[0.78rem] font-semibold tracking-[0.04em] uppercase text-[#0a1418] shadow-[0_8px_24px_rgba(94,234,212,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(94,234,212,0.35)]"
						style={{ background: "linear-gradient(135deg, #5eead4 0%, #2dd4bf 50%, #0d9488 100%)" }}
					>
						Show {roomsShown} of {totalRooms} rooms
					</Button>
				</div>
			</aside>
		</>
	);
}
