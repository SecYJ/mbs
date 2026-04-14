import { createFileRoute } from "@tanstack/react-router";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
	ChevronLeft,
	ChevronRight,
	Plus,
	SlidersHorizontal,
} from "lucide-react";
import { useRef, useState, useCallback } from "react";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";

import { AppShell } from "@/components/bookings/app-shell";
import { RoomFilters } from "@/components/bookings/room-filters";
import { BookingDialog } from "@/components/bookings/booking-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bookings")({ component: BookingsPage });

type ViewMode = "resourceTimeGridDay" | "timeGridWeek" | "dayGridMonth";

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
	{ value: "resourceTimeGridDay", label: "Day" },
	{ value: "timeGridWeek", label: "Week" },
	{ value: "dayGridMonth", label: "Month" },
];

// Mock data for rooms
const MOCK_RESOURCES = [
	{
		id: "room-1",
		title: "Horizon",
		extendedProps: { location: "3rd Floor East", capacity: 8 },
	},
	{
		id: "room-2",
		title: "Solaris",
		extendedProps: { location: "3rd Floor West", capacity: 12 },
	},
	{
		id: "room-3",
		title: "Nimbus",
		extendedProps: { location: "4th Floor East", capacity: 4 },
	},
	{
		id: "room-4",
		title: "Cascade",
		extendedProps: { location: "4th Floor West", capacity: 6 },
	},
	{
		id: "room-5",
		title: "Pinnacle",
		extendedProps: { location: "5th Floor", capacity: 20 },
	},
];

// Mock data for bookings
function getMockEvents() {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, "0");
	const dd = String(today.getDate()).padStart(2, "0");
	const dateStr = `${yyyy}-${mm}-${dd}`;

	return [
		{
			id: "evt-1",
			resourceId: "room-1",
			title: "Sprint Planning",
			start: `${dateStr}T09:00:00`,
			end: `${dateStr}T10:30:00`,
			extendedProps: { organizer: "Alice Chen", attendeeCount: 6, colorType: "blue" },
		},
		{
			id: "evt-2",
			resourceId: "room-2",
			title: "Design Review",
			start: `${dateStr}T10:00:00`,
			end: `${dateStr}T11:00:00`,
			extendedProps: { organizer: "Bob Martinez", attendeeCount: 4, colorType: "purple" },
		},
		{
			id: "evt-3",
			resourceId: "room-1",
			title: "1:1 with Manager",
			start: `${dateStr}T13:00:00`,
			end: `${dateStr}T13:30:00`,
			extendedProps: { organizer: "You", attendeeCount: 2, colorType: "indigo" },
		},
		{
			id: "evt-4",
			resourceId: "room-3",
			title: "Backend Sync",
			start: `${dateStr}T14:00:00`,
			end: `${dateStr}T15:00:00`,
			extendedProps: { organizer: "Charlie Wu", attendeeCount: 3, colorType: "cyan" },
		},
		{
			id: "evt-5",
			resourceId: "room-4",
			title: "Product Demo",
			start: `${dateStr}T15:30:00`,
			end: `${dateStr}T16:30:00`,
			extendedProps: { organizer: "Diana Lee", attendeeCount: 8, colorType: "rose" },
		},
		{
			id: "evt-6",
			resourceId: "room-5",
			title: "All Hands Meeting",
			start: `${dateStr}T11:00:00`,
			end: `${dateStr}T12:00:00`,
			extendedProps: { organizer: "CTO", attendeeCount: 18, colorType: "green" },
		},
		{
			id: "evt-7",
			resourceId: "room-2",
			title: "Interview: Sr. Engineer",
			start: `${dateStr}T14:00:00`,
			end: `${dateStr}T15:30:00`,
			extendedProps: { organizer: "HR Team", attendeeCount: 3, colorType: "pink" },
		},
		{
			id: "evt-8",
			resourceId: "room-3",
			title: "QA Standup",
			start: `${dateStr}T09:30:00`,
			end: `${dateStr}T10:00:00`,
			extendedProps: { organizer: "Eve Park", attendeeCount: 5, colorType: "orange" },
		},
	];
}

// Event colors mapped via CSS variables
const EVENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
	blue: { bg: "var(--event-blue-bg)", border: "var(--event-blue-bar)", text: "var(--event-blue-text)" },
	orange: { bg: "var(--event-orange-bg)", border: "var(--event-orange-bar)", text: "var(--event-orange-text)" },
	purple: { bg: "var(--event-purple-bg)", border: "var(--event-purple-bar)", text: "var(--event-purple-text)" },
	green: { bg: "var(--event-green-bg)", border: "var(--event-green-bar)", text: "var(--event-green-text)" },
	indigo: { bg: "var(--event-indigo-bg)", border: "var(--event-indigo-bar)", text: "var(--event-indigo-text)" },
	pink: { bg: "var(--event-pink-bg)", border: "var(--event-pink-bar)", text: "var(--event-pink-text)" },
	cyan: { bg: "var(--event-cyan-bg)", border: "var(--event-cyan-bar)", text: "var(--event-cyan-text)" },
	rose: { bg: "var(--event-rose-bg)", border: "var(--event-rose-bar)", text: "var(--event-rose-text)" },
};

function BookingsPage() {
	const calendarRef = useRef<FullCalendar>(null);
	const [currentView, setCurrentView] = useState<ViewMode>("resourceTimeGridDay");
	const [dateTitle, setDateTitle] = useState("");
	const [filtersOpen, setFiltersOpen] = useState(false);

	// Booking dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogDefaults, setDialogDefaults] = useState<{
		roomId?: string;
		start?: Date;
		end?: Date;
	}>({});

	function navigateCalendar(action: "prev" | "next" | "today") {
		const api = calendarRef.current?.getApi();
		if (!api) return;
		if (action === "prev") api.prev();
		else if (action === "next") api.next();
		else api.today();
		setDateTitle(api.view.title);
	}

	function changeView(view: ViewMode) {
		const api = calendarRef.current?.getApi();
		if (!api) return;
		api.changeView(view);
		setCurrentView(view);
		setDateTitle(api.view.title);
	}

	const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
		setDialogDefaults({
			roomId: selectInfo.resource?.id,
			start: selectInfo.start,
			end: selectInfo.end,
		});
		setDialogOpen(true);
		selectInfo.view.calendar.unselect();
	}, []);

	const handleEventClick = useCallback((_clickInfo: EventClickArg) => {
		// TODO: open event detail/edit dialog
	}, []);

	return (
		<AppShell>
			<div className="flex h-full">
				{/* Main calendar area */}
				<div className="flex flex-1 flex-col overflow-hidden">
					{/* Calendar toolbar */}
					<div className="flex shrink-0 items-center justify-between border-b border-[var(--border-grid)] bg-[var(--bg-base)] px-6 py-3">
						{/* Left: date navigation */}
						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigateCalendar("today")}
								className="border-[var(--border-subtle)] bg-transparent text-xs font-semibold text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-primary)]"
							>
								Today
							</Button>
							<div className="flex items-center gap-0.5">
								<Button
									variant="ghost"
									size="icon-xs"
									onClick={() => navigateCalendar("prev")}
									className="text-[var(--text-tertiary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-secondary)]"
								>
									<ChevronLeft size={16} />
								</Button>
								<Button
									variant="ghost"
									size="icon-xs"
									onClick={() => navigateCalendar("next")}
									className="text-[var(--text-tertiary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-secondary)]"
								>
									<ChevronRight size={16} />
								</Button>
							</div>
							<h2 className="text-sm font-semibold text-[var(--text-primary)]">{dateTitle}</h2>
						</div>

						{/* Right: view switcher, filter, new booking */}
						<div className="flex items-center gap-2.5">
							{/* View switcher */}
							<div className="flex items-center rounded-lg border border-[var(--border-grid)] bg-[var(--bg-base)] p-0.5">
								{VIEW_OPTIONS.map((opt) => (
									<button
										key={opt.value}
										type="button"
										onClick={() => changeView(opt.value)}
										className={cn(
											"cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
											currentView === opt.value
												? "bg-[var(--bg-active)] text-[var(--text-primary)]"
												: "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
										)}
									>
										{opt.label}
									</button>
								))}
							</div>

							{/* Filter toggle */}
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setFiltersOpen((p) => !p)}
								className={cn(
									"gap-1.5 text-xs",
									filtersOpen
										? "bg-[rgba(255,255,255,0.06)] text-[var(--text-secondary)]"
										: "text-[var(--text-tertiary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-secondary)]"
								)}
							>
								<SlidersHorizontal size={14} strokeWidth={1.6} />
								Filters
							</Button>

							{/* New Booking button */}
							<Button
								size="sm"
								onClick={() => {
									setDialogDefaults({});
									setDialogOpen(true);
								}}
								className="gap-1.5 border-0 text-xs font-semibold text-black shadow-[0_2px_12px_rgba(16,185,129,0.25)] transition-all hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(16,185,129,0.35)]"
								style={{
									background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
								}}
							>
								<Plus size={14} strokeWidth={2} />
								New Booking
							</Button>
						</div>
					</div>

					{/* Calendar */}
					<div className="fc-dark-theme flex-1 overflow-hidden p-4">
						<FullCalendar
							ref={calendarRef}
							plugins={[
								resourceTimeGridPlugin,
								timeGridPlugin,
								dayGridPlugin,
								interactionPlugin,
							]}
							initialView="resourceTimeGridDay"
							headerToolbar={false}
							resources={MOCK_RESOURCES}
							events={getMockEvents()}
							height="100%"
							slotMinTime="07:00:00"
							slotMaxTime="21:00:00"
							slotDuration="00:30:00"
							slotLabelInterval="01:00"
							nowIndicator
							selectable
							selectMirror
							select={handleDateSelect}
							eventClick={handleEventClick}
							allDaySlot={false}
							expandRows
							resourceLabelContent={(arg) => {
								const { location, capacity } = arg.resource.extendedProps;
								return (
									<div className="flex flex-col gap-0.5 py-1">
										<span className="text-[0.8rem] font-semibold text-[var(--text-primary)]">
											{arg.resource.title}
										</span>
										<span className="text-[0.65rem] text-[var(--text-secondary)]">
											{location} &middot; {capacity} seats
										</span>
									</div>
								);
							}}
							eventContent={(arg) => {
								const colorType = arg.event.extendedProps.colorType ?? "blue";
								const colors = EVENT_COLORS[colorType] ?? EVENT_COLORS.blue;
								const { organizer, attendeeCount } = arg.event.extendedProps;
								return (
									<div
										className="flex h-full flex-col justify-between overflow-hidden rounded-md border-l-[3px] px-2.5 py-1.5"
										style={{
											background: colors.bg,
											borderLeftColor: colors.border,
										}}
									>
										<div className="min-w-0">
											<p
												className="truncate text-[0.75rem] font-semibold leading-tight"
												style={{ color: colors.text }}
											>
												{arg.event.title}
											</p>
											{organizer && (
												<p className="mt-0.5 truncate text-[0.65rem] text-[var(--text-tertiary)]">
													{organizer}
												</p>
											)}
										</div>
										{attendeeCount && (
											<p className="text-[0.6rem] text-[var(--text-disabled)]">
												{attendeeCount} attendees
											</p>
										)}
									</div>
								);
							}}
							datesSet={(dateInfo) => {
								setDateTitle(dateInfo.view.title);
							}}
							slotLabelContent={(arg) => {
								return (
									<span className="text-[0.68rem] font-medium text-[var(--text-tertiary)]">
										{arg.text}
									</span>
								);
							}}
						/>
					</div>
				</div>

				{/* Filters panel */}
				<RoomFilters open={filtersOpen} onClose={() => setFiltersOpen(false)} />
			</div>

			{/* Booking dialog */}
			<BookingDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				defaults={dialogDefaults}
			/>
		</AppShell>
	);
}
