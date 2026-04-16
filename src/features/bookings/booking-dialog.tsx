import { useState, useEffect } from "react";
import type { EventInput } from "@fullcalendar/core";
import { Calendar, Clock, MapPin, Users, FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

// Mock registered users for the attendees picker
const MOCK_USERS = ["Alice Chen", "Bob", "Carol", "David Kim", "Eve", "Frank", "Grace Liu", "Henry Wang", "Ivan", "Julia", "Kevin", "Liam", "Mia"];

export function BookingDialog({ open, onOpenChange, mode, rooms, event, prefill, onSubmit }: BookingDialogProps) {
	const [title, setTitle] = useState("");
	const [roomId, setRoomId] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [description, setDescription] = useState("");
	const [attendees, setAttendees] = useState<string[]>([]);
	const [attendeeSearch, setAttendeeSearch] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);

	// Reset form on open
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
				<DialogContent className="border-[rgba(141,229,219,0.1)] bg-[#0c1b1f] text-[#e8dfd4] sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="font-['Fraunces'] text-xl font-normal italic text-[#e8dfd4]">
							{event.title}
						</DialogTitle>
						<DialogDescription className="text-[0.82rem] text-[#6a9590]">
							Organized by {event.extendedProps?.organizer ?? "Unknown"}
						</DialogDescription>
					</DialogHeader>

					<div className="mt-2 space-y-4">
						{/* Room */}
						{selectedRoom && (
							<div className="flex items-start gap-3">
								<MapPin className="mt-0.5 size-4 shrink-0 text-[#5a7e79]" strokeWidth={1.6} />
								<div>
									<p className="text-[0.85rem] font-medium text-[#e8dfd4]">{selectedRoom.title}</p>
									<p className="text-[0.75rem] text-[#5a7e79]">
										{selectedRoom.location} · {selectedRoom.capacity} people
									</p>
								</div>
							</div>
						)}

						{/* Time */}
						<div className="flex items-start gap-3">
							<Clock className="mt-0.5 size-4 shrink-0 text-[#5a7e79]" strokeWidth={1.6} />
							<div>
								<p className="text-[0.85rem] font-medium text-[#e8dfd4]">
									{formatTimeDisplay(event.start as string)} – {formatTimeDisplay(event.end as string)}
								</p>
								<p className="text-[0.75rem] text-[#5a7e79]">
									{formatDateDisplay(event.start as string)}
								</p>
							</div>
						</div>

						{/* Attendees */}
						{event.extendedProps?.attendees?.length > 0 && (
							<div className="flex items-start gap-3">
								<Users className="mt-0.5 size-4 shrink-0 text-[#5a7e79]" strokeWidth={1.6} />
								<div className="flex flex-wrap gap-1.5">
									{event.extendedProps.attendees.map((a: string) => (
										<Badge
											key={a}
											variant="outline"
											className="border-[rgba(141,229,219,0.12)] bg-[rgba(96,215,207,0.06)] text-[0.7rem] text-[#6a9590]"
										>
											{a}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Description */}
						{event.extendedProps?.description && (
							<div className="flex items-start gap-3">
								<FileText className="mt-0.5 size-4 shrink-0 text-[#5a7e79]" strokeWidth={1.6} />
								<p className="text-[0.82rem] leading-relaxed text-[#6a9590]">
									{event.extendedProps.description}
								</p>
							</div>
						)}
					</div>

					<div className="mt-4 flex gap-2">
						<Button
							variant="outline"
							className="flex-1 cursor-pointer border-[rgba(141,229,219,0.12)] bg-transparent text-[0.78rem] text-[#6a9590] hover:bg-[rgba(96,215,207,0.06)] hover:text-[#8de5db]"
							onClick={() => onOpenChange(false)}
						>
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	// ── Create mode ──
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-[rgba(141,229,219,0.1)] bg-[#0c1b1f] text-[#e8dfd4] sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="font-['Fraunces'] text-xl font-normal italic text-[#e8dfd4]">
						New Booking
					</DialogTitle>
					<DialogDescription className="text-[0.82rem] text-[#6a9590]">
						Reserve a meeting room for your team
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="mt-2 space-y-5">
					{/* Title */}
					<div className="space-y-2">
						<Label className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-[#5a7e79]">
							Meeting Title
						</Label>
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g. Sprint Planning"
							required
							className="login-input-underline h-10 text-[0.85rem] text-[#e8dfd4] shadow-none placeholder:text-[#3e5e58] focus-visible:ring-0"
						/>
					</div>

					{/* Room */}
					<div className="space-y-2">
						<Label className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-[#5a7e79]">
							Room
						</Label>
						<Select value={roomId} onValueChange={setRoomId} required>
							<SelectTrigger className="h-10 border-0 border-b border-[rgba(141,229,219,0.16)] bg-transparent text-[0.85rem] text-[#e8dfd4] shadow-none ring-0 rounded-none focus:border-[#60d7cf] focus:ring-0 [&>svg]:text-[#5a7e79]">
								<SelectValue placeholder="Select a room" />
							</SelectTrigger>
							<SelectContent className="border-[rgba(141,229,219,0.12)] bg-[#0f2228]">
								{rooms.map((room) => (
									<SelectItem
										key={room.id}
										value={room.id}
										className="text-[#e8dfd4] focus:bg-[rgba(96,215,207,0.1)] focus:text-[#e8dfd4]"
									>
										<span className="font-medium">{room.title}</span>
										<span className="ml-2 text-[#5a7e79]">
											· {room.location} · {room.capacity}p
										</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{selectedRoom && (
							<div className="flex flex-wrap gap-1.5 pt-1">
								{selectedRoom.equipment.map((eq) => (
									<Badge
										key={eq}
										variant="outline"
										className="border-[rgba(141,229,219,0.1)] bg-[rgba(96,215,207,0.04)] text-[0.65rem] text-[#5a7e79]"
									>
										{eq}
									</Badge>
								))}
							</div>
						)}
					</div>

					{/* Time */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-[#5a7e79]">
								Start Time
							</Label>
							<Input
								type="datetime-local"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								required
								className="login-input-underline h-10 text-[0.82rem] text-[#e8dfd4] shadow-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:invert"
							/>
						</div>
						<div className="space-y-2">
							<Label className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-[#5a7e79]">
								End Time
							</Label>
							<Input
								type="datetime-local"
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								required
								className="login-input-underline h-10 text-[0.82rem] text-[#e8dfd4] shadow-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:invert"
							/>
						</div>
					</div>

					{/* Attendees */}
					<div className="space-y-2">
						<Label className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-[#5a7e79]">
							Attendees
						</Label>
						{attendees.length > 0 && (
							<div className="flex flex-wrap gap-1.5 pb-1">
								{attendees.map((a) => (
									<Badge
										key={a}
										variant="outline"
										className="gap-1 border-[rgba(141,229,219,0.12)] bg-[rgba(96,215,207,0.06)] text-[0.7rem] text-[#6a9590]"
									>
										{a}
										<button
											type="button"
											onClick={() => removeAttendee(a)}
											className="ml-0.5 cursor-pointer text-[#5a7e79] transition-colors hover:text-[#60d7cf]"
										>
											<X className="size-3" />
										</button>
									</Badge>
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
								className="login-input-underline h-10 text-[0.85rem] text-[#e8dfd4] shadow-none placeholder:text-[#3e5e58] focus-visible:ring-0"
							/>
							{showSuggestions && attendeeSearch && filteredSuggestions.length > 0 && (
								<div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-36 overflow-y-auto rounded-lg border border-[rgba(141,229,219,0.12)] bg-[#0f2228] py-1 shadow-xl">
									{filteredSuggestions.map((user) => (
										<button
											type="button"
											key={user}
											onMouseDown={() => addAttendee(user)}
											className="flex w-full cursor-pointer items-center px-3 py-2 text-left text-[0.82rem] text-[#6a9590] transition-colors hover:bg-[rgba(96,215,207,0.08)] hover:text-[#e8dfd4]"
										>
											{user}
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-[#5a7e79]">
							Description
							<span className="ml-1 font-normal normal-case text-[#4a6e68]">(optional)</span>
						</Label>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Meeting agenda or notes..."
							rows={3}
							className="resize-none border-0 border-b border-[rgba(141,229,219,0.16)] rounded-none bg-transparent text-[0.85rem] text-[#e8dfd4] shadow-none placeholder:text-[#3e5e58] focus-visible:ring-0 focus:border-[#60d7cf]"
						/>
					</div>

					{/* Actions */}
					<div className="flex gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							className="flex-1 cursor-pointer border-[rgba(141,229,219,0.12)] bg-transparent text-[0.78rem] text-[#6a9590] hover:bg-[rgba(96,215,207,0.06)] hover:text-[#8de5db]"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="flex-1 cursor-pointer text-[0.78rem] font-semibold tracking-[0.04em] uppercase text-[#0a1418] shadow-[0_4px_24px_rgba(96,215,207,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(96,215,207,0.3)]"
							style={{ background: "linear-gradient(135deg, #60d7cf 0%, #2f8a6a 100%)" }}
						>
							Create Booking
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
