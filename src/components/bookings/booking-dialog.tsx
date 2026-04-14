import { Clock, DoorOpen, FileText, Tag, Users, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ROOMS = [
	{ id: "room-1", name: "Horizon", location: "3rd Floor East", capacity: 8 },
	{ id: "room-2", name: "Solaris", location: "3rd Floor West", capacity: 12 },
	{ id: "room-3", name: "Nimbus", location: "4th Floor East", capacity: 4 },
	{ id: "room-4", name: "Cascade", location: "4th Floor West", capacity: 6 },
	{ id: "room-5", name: "Pinnacle", location: "5th Floor", capacity: 20 },
];

const MOCK_USERS = [
	{ id: "u1", name: "Alice Chen" },
	{ id: "u2", name: "Bob Martinez" },
	{ id: "u3", name: "Charlie Wu" },
	{ id: "u4", name: "Diana Lee" },
	{ id: "u5", name: "Eve Park" },
	{ id: "u6", name: "Frank Johnson" },
	{ id: "u7", name: "Grace Kim" },
];

function formatDateForInput(date: Date): string {
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

function formatTimeForInput(date: Date): string {
	const hh = String(date.getHours()).padStart(2, "0");
	const min = String(date.getMinutes()).padStart(2, "0");
	return `${hh}:${min}`;
}

interface BookingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaults?: {
		roomId?: string;
		start?: Date;
		end?: Date;
	};
}

export function BookingDialog({ open, onOpenChange, defaults = {} }: BookingDialogProps) {
	const now = new Date();
	const defaultDate = defaults.start ? formatDateForInput(defaults.start) : formatDateForInput(now);
	const defaultStartTime = defaults.start ? formatTimeForInput(defaults.start) : "09:00";
	const defaultEndTime = defaults.end ? formatTimeForInput(defaults.end) : "10:00";

	const [title, setTitle] = useState("");
	const [room, setRoom] = useState(defaults.roomId ?? "");
	const [date, setDate] = useState(defaultDate);
	const [startTime, setStartTime] = useState(defaultStartTime);
	const [endTime, setEndTime] = useState(defaultEndTime);
	const [description, setDescription] = useState("");
	const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
	const [attendeeSearch, setAttendeeSearch] = useState("");

	const filteredUsers = MOCK_USERS.filter(
		(u) =>
			!selectedAttendees.includes(u.id) &&
			u.name.toLowerCase().includes(attendeeSearch.toLowerCase())
	);

	function toggleAttendee(userId: string) {
		setSelectedAttendees((prev) =>
			prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
		);
		setAttendeeSearch("");
	}

	function removeAttendee(userId: string) {
		setSelectedAttendees((prev) => prev.filter((id) => id !== userId));
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		// TODO: submit booking to backend
		onOpenChange(false);
	}

	const inputClass =
		"h-10 border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus-visible:border-[rgba(16,185,129,0.4)] focus-visible:ring-[rgba(16,185,129,0.15)]";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[520px] gap-0 overflow-hidden border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-0 text-[var(--text-primary)] shadow-2xl sm:rounded-xl">
				<DialogHeader className="border-b border-[var(--border-grid)] px-6 py-5">
					<DialogTitle className="text-base font-semibold text-[var(--text-primary)]">
						New Booking
					</DialogTitle>
					<DialogDescription className="sr-only">
						Create a new meeting room booking
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-0">
					<div className="space-y-5 px-6 py-5">
						{/* Title */}
						<div className="space-y-2">
							<Label className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
								<Tag size={12} strokeWidth={1.6} />
								Meeting title
							</Label>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="e.g. Sprint Planning"
								className={inputClass}
								autoFocus
							/>
						</div>

						{/* Room */}
						<div className="space-y-2">
							<Label className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
								<DoorOpen size={12} strokeWidth={1.6} />
								Room
							</Label>
							<Select value={room} onValueChange={setRoom}>
								<SelectTrigger className={cn(inputClass, "w-full")}>
									<SelectValue placeholder="Select a room" />
								</SelectTrigger>
								<SelectContent className="border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
									{ROOMS.map((r) => (
										<SelectItem key={r.id} value={r.id}>
											<span className="font-medium">{r.name}</span>
											<span className="ml-2 text-[var(--text-tertiary)]">
												{r.location} &middot; {r.capacity} seats
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Date & Time */}
						<div className="space-y-2">
							<Label className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
								<Clock size={12} strokeWidth={1.6} />
								Date & Time
							</Label>
							<div className="grid grid-cols-3 gap-3">
								<Input
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
									className={cn(inputClass, "col-span-1")}
								/>
								<Input
									type="time"
									value={startTime}
									onChange={(e) => setStartTime(e.target.value)}
									className={inputClass}
								/>
								<Input
									type="time"
									value={endTime}
									onChange={(e) => setEndTime(e.target.value)}
									className={inputClass}
								/>
							</div>
							<div className="grid grid-cols-3 gap-3">
								<span className="text-[0.6rem] text-[var(--text-disabled)]">Date</span>
								<span className="text-[0.6rem] text-[var(--text-disabled)]">Start</span>
								<span className="text-[0.6rem] text-[var(--text-disabled)]">End</span>
							</div>
						</div>

						{/* Attendees */}
						<div className="space-y-2">
							<Label className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
								<Users size={12} strokeWidth={1.6} />
								Attendees
							</Label>

							{/* Selected attendees */}
							{selectedAttendees.length > 0 && (
								<div className="flex flex-wrap gap-1.5 pb-1">
									{selectedAttendees.map((userId) => {
										const user = MOCK_USERS.find((u) => u.id === userId);
										if (!user) return null;
										return (
											<Badge
												key={userId}
												variant="secondary"
												className="gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-active)] pl-2.5 pr-1 text-xs font-medium text-[var(--text-secondary)]"
											>
												{user.name}
												<button
													type="button"
													onClick={() => removeAttendee(userId)}
													className="ml-0.5 cursor-pointer rounded p-0.5 text-[var(--text-tertiary)] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--text-secondary)]"
												>
													<X size={12} />
												</button>
											</Badge>
										);
									})}
								</div>
							)}

							{/* Search input */}
							<div className="relative">
								<Input
									value={attendeeSearch}
									onChange={(e) => setAttendeeSearch(e.target.value)}
									placeholder="Search people..."
									className={inputClass}
								/>
								{/* Dropdown */}
								{attendeeSearch.length > 0 && filteredUsers.length > 0 && (
									<div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-1 shadow-xl">
										{filteredUsers.map((user) => (
											<button
												key={user.id}
												type="button"
												onClick={() => toggleAttendee(user.id)}
												className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[rgba(255,255,255,0.04)]"
											>
												<div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--bg-active)] text-[0.6rem] font-semibold text-[var(--text-secondary)]">
													{user.name.split(" ").map((n) => n[0]).join("")}
												</div>
												{user.name}
											</button>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
								<FileText size={12} strokeWidth={1.6} />
								Notes
								<span className="font-normal normal-case tracking-normal text-[var(--text-disabled)]">
									(optional)
								</span>
							</Label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Add meeting agenda or notes..."
								rows={3}
								className={cn(
									inputClass,
									"h-auto w-full resize-none rounded-md border px-3 py-2.5 outline-none focus-visible:ring-[2px]"
								)}
							/>
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-end gap-3 border-t border-[var(--border-grid)] bg-[var(--bg-base)] px-6 py-4">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => onOpenChange(false)}
							className="text-[var(--text-tertiary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-secondary)]"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							size="sm"
							className="border-0 px-5 font-semibold text-black shadow-[0_2px_12px_rgba(16,185,129,0.25)]"
							style={{
								background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
							}}
						>
							Create Booking
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
