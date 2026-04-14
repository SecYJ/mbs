import { useState, useMemo } from "react";
import {
	Plus,
	Building2,
	Monitor,
	Video,
	PenLine,
	Tv,
	Phone,
	ChevronDown,
	ChevronUp,
	MoreHorizontal,
	MapPin,
	UsersRound,
	Trash2,
	X,
} from "lucide-react";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { StatusToggle } from "@/features/admin/components/status-toggle";
import { EmptyState } from "@/features/admin/components/empty-state";
import { useAdminToast } from "@/features/admin/components/admin-layout";

/* ── Mock data ── */

interface Room {
	id: string;
	name: string;
	location: string;
	capacity: number;
	equipment: string[];
	active: boolean;
	description: string;
}

const EQUIPMENT_ICONS: Record<string, typeof Monitor> = {
	Projector: Monitor,
	"Video Conference": Video,
	Whiteboard: PenLine,
	"TV Screen": Tv,
	Speakerphone: Phone,
};

const EQUIPMENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
	Projector: {
		bg: "var(--a-eq-blue-bg)",
		border: "var(--a-eq-blue-border)",
		text: "var(--a-eq-blue)",
	},
	"Video Conference": {
		bg: "var(--a-eq-violet-bg)",
		border: "var(--a-eq-violet-border)",
		text: "var(--a-eq-violet)",
	},
	Whiteboard: {
		bg: "var(--a-eq-emerald-bg)",
		border: "var(--a-eq-emerald-border)",
		text: "var(--a-eq-emerald)",
	},
	"TV Screen": {
		bg: "var(--a-eq-cyan-bg)",
		border: "var(--a-eq-cyan-border)",
		text: "var(--a-eq-cyan)",
	},
	Speakerphone: {
		bg: "var(--a-eq-rose-bg)",
		border: "var(--a-eq-rose-border)",
		text: "var(--a-eq-rose)",
	},
};

const initialRooms: Room[] = [
	{
		id: "1",
		name: "Horizon Hall",
		location: "3F East Wing",
		capacity: 20,
		equipment: ["Projector", "Video Conference", "Whiteboard"],
		active: true,
		description: "Large conference room ideal for all-hands and workshops.",
	},
	{
		id: "2",
		name: "Summit Room",
		location: "2F West Wing",
		capacity: 8,
		equipment: ["Video Conference", "TV Screen"],
		active: true,
		description: "Mid-size meeting room with dual displays.",
	},
	{
		id: "3",
		name: "Spark Pod",
		location: "1F Central",
		capacity: 4,
		equipment: ["Whiteboard"],
		active: true,
		description: "Compact brainstorming space.",
	},
	{
		id: "4",
		name: "Boardroom One",
		location: "5F Executive",
		capacity: 30,
		equipment: ["Projector", "Video Conference", "TV Screen", "Speakerphone"],
		active: false,
		description: "Executive boardroom, currently under renovation.",
	},
	{
		id: "5",
		name: "Quiet Focus",
		location: "2F East Wing",
		capacity: 2,
		equipment: ["Whiteboard"],
		active: true,
		description: "Small private room for 1-on-1 meetings.",
	},
];

/* ── Sort helper ── */

type SortField = "name" | "location" | "capacity";
type SortDir = "asc" | "desc" | null;

export function RoomsPage() {
	const { toast } = useAdminToast();
	const [rooms, setRooms] = useState(initialRooms);
	const [search, setSearch] = useState("");
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [sortField, setSortField] = useState<SortField | null>(null);
	const [sortDir, setSortDir] = useState<SortDir>(null);

	const toggleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
			if (sortDir === "desc") setSortField(null);
		} else {
			setSortField(field);
			setSortDir("asc");
		}
	};

	const filtered = useMemo(() => {
		let list = rooms;
		if (search) {
			const q = search.toLowerCase();
			list = list.filter(
				(r) =>
					r.name.toLowerCase().includes(q) ||
					r.location.toLowerCase().includes(q),
			);
		}
		if (sortField && sortDir) {
			list = [...list].sort((a, b) => {
				const av = a[sortField];
				const bv = b[sortField];
				const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
				return sortDir === "asc" ? cmp : -cmp;
			});
		}
		return list;
	}, [rooms, search, sortField, sortDir]);

	const toggleActive = (id: string) => {
		setRooms((prev) =>
			prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
		);
		const room = rooms.find((r) => r.id === id);
		toast(
			`${room?.name} ${room?.active ? "disabled" : "enabled"}`,
			room?.active ? "info" : "success",
		);
	};

	const SortIndicator = ({ field }: { field: SortField }) => {
		if (sortField !== field || !sortDir) return null;
		return (
			<span className="ml-1 inline-block text-[0.5rem]" style={{ color: "var(--a-accent)" }}>
				{sortDir === "asc" ? "▲" : "▼"}
			</span>
		);
	};

	return (
		<div>
			<AdminHeader
				title="Rooms"
				searchPlaceholder="Search rooms..."
				searchValue={search}
				onSearchChange={setSearch}
				action={
					<button
						type="button"
						className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
						style={{
							background: "var(--a-accent)",
							color: "#fff",
						}}
						onMouseEnter={(e) =>
							(e.currentTarget.style.background = "var(--a-accent-hover)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.background = "var(--a-accent)")
						}
					>
						<Plus className="size-3.5" strokeWidth={2.2} />
						New Room
					</button>
				}
			/>

			<div className="p-6">
				{filtered.length === 0 && !search ? (
					<EmptyState
						icon={Building2}
						title="No rooms yet"
						description="Create your first meeting room to get started with the booking system."
						action={
							<button
								type="button"
								className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
								style={{ background: "var(--a-accent)", color: "#fff" }}
							>
								<Plus className="size-4" strokeWidth={2} />
								Create Room
							</button>
						}
					/>
				) : filtered.length === 0 ? (
					<p
						className="py-12 text-center text-sm"
						style={{ color: "var(--a-text-muted)" }}
					>
						No rooms match "{search}"
					</p>
				) : (
					<div
						className="overflow-hidden rounded-xl border"
						style={{
							borderColor: "var(--a-border-hover)",
							background: "var(--a-surface-0)",
						}}
					>
						<table className="admin-table">
							<thead>
								<tr>
									<th data-sortable onClick={() => toggleSort("name")} style={{ width: "22%" }}>
										Name <SortIndicator field="name" />
									</th>
									<th data-sortable onClick={() => toggleSort("location")} style={{ width: "18%" }}>
										Location <SortIndicator field="location" />
									</th>
									<th data-sortable onClick={() => toggleSort("capacity")} style={{ width: "10%" }}>
										Capacity <SortIndicator field="capacity" />
									</th>
									<th style={{ width: "28%" }}>Equipment</th>
									<th style={{ width: "10%" }}>Status</th>
									<th style={{ width: "12%" }} />
								</tr>
							</thead>
							<tbody>
								{filtered.map((room) => {
									const isExpanded = expandedId === room.id;
									return (
										<RoomRow
											key={room.id}
											room={room}
											isExpanded={isExpanded}
											onToggleExpand={() =>
												setExpandedId(isExpanded ? null : room.id)
											}
											onToggleActive={() => toggleActive(room.id)}
										/>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}

/* ── Room row ── */

function RoomRow({
	room,
	isExpanded,
	onToggleExpand,
	onToggleActive,
}: {
	room: Room;
	isExpanded: boolean;
	onToggleExpand: () => void;
	onToggleActive: () => void;
}) {
	return (
		<>
			<tr
				className="cursor-pointer"
				onClick={onToggleExpand}
				data-disabled={!room.active || undefined}
			>
				<td>
					<div className="flex items-center gap-2">
						<span className="font-semibold" style={{ color: "var(--a-text)" }}>
							{room.name}
						</span>
						{isExpanded ? (
							<ChevronUp className="size-3.5" style={{ color: "var(--a-text-muted)" }} />
						) : (
							<ChevronDown className="size-3.5" style={{ color: "var(--a-text-muted)" }} />
						)}
					</div>
				</td>
				<td>
					<span className="flex items-center gap-1.5" style={{ color: "var(--a-text-secondary)" }}>
						<MapPin className="size-3" strokeWidth={1.6} />
						{room.location}
					</span>
				</td>
				<td>
					<span className="tabular-nums flex items-center gap-1.5" style={{ color: "var(--a-text-secondary)" }}>
						<UsersRound className="size-3" strokeWidth={1.6} />
						{room.capacity}
					</span>
				</td>
				<td>
					<div className="flex flex-wrap gap-1.5">
						{room.equipment.map((eq) => {
							const Icon = EQUIPMENT_ICONS[eq] ?? Monitor;
							const colors = EQUIPMENT_COLORS[eq] ?? {
								bg: "var(--a-surface-2)",
								border: "var(--a-border)",
								text: "var(--a-text-secondary)",
							};
							return (
								<span
									key={eq}
									className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.6875rem] font-medium"
									style={{
										background: colors.bg,
										color: colors.text,
										border: `1px solid ${colors.border}`,
									}}
								>
									<Icon className="size-3" strokeWidth={1.6} />
									{eq}
								</span>
							);
						})}
					</div>
				</td>
				<td onClick={(e) => e.stopPropagation()}>
					<StatusToggle
						checked={room.active}
						onChange={onToggleActive}
						label={`${room.name} status`}
					/>
				</td>
				<td onClick={(e) => e.stopPropagation()}>
					<button
						type="button"
						className="flex size-7 items-center justify-center rounded-md transition-colors"
						style={{ color: "var(--a-text-muted)" }}
						onMouseEnter={(e) =>
							(e.currentTarget.style.background = "var(--a-surface-2)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.background = "transparent")
						}
					>
						<MoreHorizontal className="size-4" />
					</button>
				</td>
			</tr>

			{/* ── Expanded detail ── */}
			{isExpanded && (
				<tr>
					<td
						colSpan={6}
						style={{
							padding: 0,
							background: "var(--a-surface-1)",
							borderBottom: "1px solid var(--a-border)",
						}}
					>
						<div className="admin-expand-row px-6 py-5">
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-4">
									<div>
										<label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider" style={{ color: "var(--a-text-muted)" }}>
											Room Name
										</label>
										<input
											className="admin-input w-full"
											defaultValue={room.name}
										/>
									</div>
									<div>
										<label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider" style={{ color: "var(--a-text-muted)" }}>
											Location
										</label>
										<input
											className="admin-input w-full"
											defaultValue={room.location}
										/>
									</div>
									<div>
										<label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider" style={{ color: "var(--a-text-muted)" }}>
											Capacity
										</label>
										<input
											type="number"
											className="admin-input w-24"
											defaultValue={room.capacity}
										/>
									</div>
								</div>
								<div className="space-y-4">
									<div>
										<label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider" style={{ color: "var(--a-text-muted)" }}>
											Description
										</label>
										<textarea
											className="admin-input w-full resize-none"
											style={{ height: 80, paddingTop: "0.5rem" }}
											defaultValue={room.description}
										/>
									</div>
									<div>
										<label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider" style={{ color: "var(--a-text-muted)" }}>
											Equipment
										</label>
										<div className="flex flex-wrap gap-1.5">
											{room.equipment.map((eq) => (
												<span
													key={eq}
													className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
													style={{
														background: "var(--a-accent-subtle)",
														color: "var(--a-accent)",
														border: "1px solid var(--a-accent-border)",
													}}
												>
													{eq}
													<X className="size-3 cursor-pointer opacity-60 hover:opacity-100" />
												</span>
											))}
										</div>
									</div>
								</div>
							</div>

							<div className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--a-border)" }}>
								<button
									type="button"
									className="rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors"
									style={{
										background: "var(--a-accent)",
										color: "#fff",
									}}
								>
									Save Changes
								</button>
								<button
									type="button"
									onClick={onToggleExpand}
									className="rounded-lg px-4 py-1.5 text-xs font-medium transition-colors"
									style={{
										color: "var(--a-text-secondary)",
										background: "var(--a-surface-2)",
									}}
								>
									Cancel
								</button>
								<div className="flex-1" />
								<button
									type="button"
									className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
									style={{
										color: "var(--a-danger)",
										background: "var(--a-danger-subtle)",
									}}
								>
									<Trash2 className="size-3" />
									Delete Room
								</button>
							</div>
						</div>
					</td>
				</tr>
			)}
		</>
	);
}
