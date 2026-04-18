import { useState, useEffect } from "react";
import type { EventInput } from "@fullcalendar/core";
import { Clock, MapPin, Users, FileText, X, ArrowRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export interface BookingFormData {
	title: string;
	roomId: string;
	start: Date;
	end: Date;
	attendees: string[];
	description: string;
}

interface Room {
	id: string;
	title: string;
	location: string;
	capacity: number;
	equipment: string[];
}

interface BookingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "view";
	rooms: Room[];
	event: EventInput | null;
	prefill: { roomId?: string; start?: Date; end?: Date };
	onSubmit: (data: BookingFormData) => void;
}

function formatDateTimeLocal(date: Date): string {
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatTimeDisplay(dateStr: string | undefined): string {
	if (!dateStr) return "";
	const d = new Date(dateStr);
	return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDateDisplay(dateStr: string | undefined): string {
	if (!dateStr) return "";
	const d = new Date(dateStr);
	return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const MOCK_USERS = ["Alice Chen", "Bob", "Carol", "David Kim", "Eve", "Frank", "Grace Liu", "Henry Wang", "Ivan", "Julia", "Kevin", "Liam", "Mia"];

const DIALOG_CLASS =
	"border border-[var(--hairline)] bg-[var(--surface-01)] text-[var(--bone)] rounded-none shadow-[0_40px_80px_rgba(0,0,0,0.6)]";

export function BookingDialog({ open, onOpenChange, mode, rooms, event, prefill, onSubmit }: BookingDialogProps) {
	const [title, setTitle] = useState("");
	const [roomId, setRoomId] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [description, setDescription] = useState("");
	const [attendees, setAttendees] = useState<string[]>([]);
	const [attendeeSearch, setAttendeeSearch] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);

	useEffect(() => {
		if (!open) return;

		if (mode === "create") {
			setTitle("");
			setRoomId(prefill.roomId ?? "");
			setStartTime(prefill.start ? formatDateTimeLocal(prefill.start) : "");
			setEndTime(prefill.end ? formatDateTimeLocal(prefill.end) : "");
			setDescription("");
			setAttendees([]);
			setAttendeeSearch("");
		}
	}, [open, mode, prefill]);

	const filteredSuggestions = MOCK_USERS.filter(
		(u) => !attendees.includes(u) && u.toLowerCase().includes(attendeeSearch.toLowerCase()),
	);

	const addAttendee = (name: string) => {
		setAttendees((prev) => [...prev, name]);
		setAttendeeSearch("");
		setShowSuggestions(false);
	};

	const removeAttendee = (name: string) => {
		setAttendees((prev) => prev.filter((a) => a !== name));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title || !roomId || !startTime || !endTime) return;

		onSubmit({
			title,
			roomId,
			start: new Date(startTime),
			end: new Date(endTime),
			attendees,
			description,
		});
	};

	const selectedRoom = rooms.find((r) => r.id === (mode === "view" ? String(event?.resourceId) : roomId));

	// ── View mode ──
	if (mode === "view" && event) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className={`${DIALOG_CLASS} sm:max-w-md`}>
					<DialogHeader>
						<p className="eyebrow eyebrow-gold">Reservation</p>
						<DialogTitle className="mt-2 display-italic text-[1.75rem] leading-[1.05] font-normal text-[var(--bone)]">
							{event.title}
						</DialogTitle>
						<DialogDescription className="text-[0.78rem] text-[var(--bone-muted)]">
							Organized by{" "}
							<span className="text-[var(--bone)]">
								{event.extendedProps?.organizer ?? "Unknown"}
							</span>
						</DialogDescription>
					</DialogHeader>

					<div className="mt-4 border-t border-[var(--hairline)] pt-6">
						<dl className="space-y-5">
							{selectedRoom && (
								<InfoRow icon={<MapPin className="size-[15px]" strokeWidth={1.4} />} label="Room">
									<span className="text-[0.88rem] font-medium text-[var(--bone)]">
										{selectedRoom.title}
									</span>
									<span className="tabular-num ml-2 text-[0.72rem] text-[var(--bone-dim)]">
										{selectedRoom.location} &middot; {selectedRoom.capacity}p
									</span>
								</InfoRow>
							)}

							<InfoRow icon={<Clock className="size-[15px]" strokeWidth={1.4} />} label="Time">
								<span className="tabular-num text-[0.95rem] font-medium text-[var(--gold)]">
									{formatTimeDisplay(event.start as string)} &mdash;{" "}
									{formatTimeDisplay(event.end as string)}
								</span>
								<span className="ml-3 text-[0.72rem] text-[var(--bone-dim)]">
									{formatDateDisplay(event.start as string)}
								</span>
							</InfoRow>

							{event.extendedProps?.attendees?.length > 0 && (
								<InfoRow icon={<Users className="size-[15px]" strokeWidth={1.4} />} label="Attendees">
									<div className="flex flex-wrap gap-1.5">
										{event.extendedProps.attendees.map((a: string) => (
											<span
												key={a}
												className="border border-[var(--hairline)] px-2 py-0.5 text-[0.7rem] text-[var(--bone-muted)]"
											>
												{a}
											</span>
										))}
									</div>
								</InfoRow>
							)}

							{event.extendedProps?.description && (
								<InfoRow icon={<FileText className="size-[15px]" strokeWidth={1.4} />} label="Notes">
									<p className="text-[0.82rem] leading-relaxed text-[var(--bone-muted)]">
										{event.extendedProps.description}
									</p>
								</InfoRow>
							)}
						</dl>
					</div>

					<div className="mt-6 border-t border-[var(--hairline)] pt-5">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="w-full cursor-pointer border border-[var(--hairline)] py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-[var(--bone-muted)] transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
						>
							Close
						</button>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	// ── Create mode ──
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={`${DIALOG_CLASS} sm:max-w-lg`}>
				<DialogHeader>
					<p className="eyebrow eyebrow-gold">New Reservation</p>
					<DialogTitle className="mt-2 display-italic text-[1.75rem] leading-[1.05] font-normal text-[var(--bone)]">
						Reserve a room.
					</DialogTitle>
					<DialogDescription className="text-[0.78rem] text-[var(--bone-muted)]">
						Enter the details below to add a booking to the ledger.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="mt-4 space-y-6 border-t border-[var(--hairline)] pt-6">
					<div className="space-y-2">
						<Label className="eyebrow block">Meeting Title</Label>
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g. Sprint Planning"
							required
							className="login-input-underline h-10 rounded-none bg-transparent text-[0.9rem] text-[var(--bone)] shadow-none placeholder:text-[var(--bone-faint)] focus-visible:ring-0"
						/>
					</div>

					<div className="space-y-2">
						<Label className="eyebrow block">Room</Label>
						<Select value={roomId} onValueChange={setRoomId} required>
							<SelectTrigger className="h-10 border-0 border-b border-[var(--hairline)] bg-transparent text-[0.9rem] text-[var(--bone)] shadow-none ring-0 rounded-none focus:border-[var(--gold)] focus:ring-0 [&>svg]:text-[var(--bone-dim)]">
								<SelectValue placeholder="Select a room" />
							</SelectTrigger>
							<SelectContent className="rounded-none border-[var(--hairline)] bg-[var(--surface-02)]">
								{rooms.map((room) => (
									<SelectItem
										key={room.id}
										value={room.id}
										className="rounded-none text-[var(--bone)] focus:bg-[var(--gold-wash)] focus:text-[var(--bone)]"
									>
										<span className="font-medium">{room.title}</span>
										<span className="tabular-num ml-2 text-[var(--bone-dim)]">
											&middot; {room.location} &middot; {room.capacity}p
										</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{selectedRoom && (
							<div className="flex flex-wrap gap-1.5 pt-2">
								{selectedRoom.equipment.map((eq) => (
									<span
										key={eq}
										className="border border-[var(--hairline)] px-2 py-0.5 text-[0.66rem] tracking-[0.08em] uppercase text-[var(--bone-dim)]"
									>
										{eq}
									</span>
								))}
							</div>
						)}
					</div>

					<div className="grid grid-cols-2 gap-5">
						<div className="space-y-2">
							<Label className="eyebrow block">Start Time</Label>
							<Input
								type="datetime-local"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								required
								className="login-input-underline tabular-num h-10 rounded-none bg-transparent text-[0.85rem] text-[var(--bone)] shadow-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:invert"
							/>
						</div>
						<div className="space-y-2">
							<Label className="eyebrow block">End Time</Label>
							<Input
								type="datetime-local"
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								required
								className="login-input-underline tabular-num h-10 rounded-none bg-transparent text-[0.85rem] text-[var(--bone)] shadow-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:invert"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label className="eyebrow block">Attendees</Label>
						{attendees.length > 0 && (
							<div className="flex flex-wrap gap-1.5 pb-2">
								{attendees.map((a) => (
									<span
										key={a}
										className="inline-flex items-center gap-1 border border-[var(--hairline)] bg-[var(--surface-02)] px-2 py-0.5 text-[0.7rem] text-[var(--bone-muted)]"
									>
										{a}
										<button
											type="button"
											onClick={() => removeAttendee(a)}
											aria-label={`Remove ${a}`}
											className="ml-0.5 cursor-pointer text-[var(--bone-dim)] transition-colors hover:text-[var(--gold)]"
										>
											<X className="size-3" strokeWidth={1.6} />
										</button>
									</span>
								))}
							</div>
						)}
						<div className="relative">
							<Input
								value={attendeeSearch}
								onChange={(e) => {
									setAttendeeSearch(e.target.value);
									setShowSuggestions(true);
								}}
								onFocus={() => setShowSuggestions(true)}
								onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
								placeholder="Search users to invite..."
								className="login-input-underline h-10 rounded-none bg-transparent text-[0.9rem] text-[var(--bone)] shadow-none placeholder:text-[var(--bone-faint)] focus-visible:ring-0"
							/>
							{showSuggestions && attendeeSearch && filteredSuggestions.length > 0 && (
								<div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto border border-[var(--hairline)] bg-[var(--surface-02)] py-1 shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
									{filteredSuggestions.map((user) => (
										<button
											type="button"
											key={user}
											onMouseDown={() => addAttendee(user)}
											className="flex w-full cursor-pointer items-center px-4 py-2 text-left text-[0.82rem] text-[var(--bone-muted)] transition-colors hover:bg-[var(--gold-wash)] hover:text-[var(--bone)]"
										>
											{user}
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label className="eyebrow block">
							Description <span className="ml-1 text-[var(--bone-faint)]">(optional)</span>
						</Label>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Meeting agenda or notes..."
							rows={3}
							className="resize-none rounded-none border-0 border-b border-[var(--hairline)] bg-transparent px-0.5 text-[0.88rem] text-[var(--bone)] shadow-none placeholder:text-[var(--bone-faint)] focus-visible:ring-0 focus:border-[var(--gold)]"
						/>
					</div>

					<div className="flex gap-3 border-t border-[var(--hairline)] pt-5">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="flex-1 cursor-pointer border border-[var(--hairline)] py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-[var(--bone-muted)] transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="group flex flex-1 cursor-pointer items-center justify-center gap-2 border border-[var(--bone)] bg-[var(--bone)] py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-black transition-all hover:bg-white hover:tracking-[0.32em]"
						>
							<span>Reserve</span>
							<ArrowRight
								className="size-4 transition-transform duration-300 group-hover:translate-x-1"
								strokeWidth={1.6}
							/>
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function InfoRow({
	icon,
	label,
	children,
}: {
	icon: React.ReactNode;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="grid grid-cols-[88px_1fr] items-start gap-4">
			<div className="flex items-center gap-2 pt-[2px]">
				<span className="text-[var(--bone-dim)]">{icon}</span>
				<span className="eyebrow">{label}</span>
			</div>
			<div className="flex flex-wrap items-baseline">{children}</div>
		</div>
	);
}
