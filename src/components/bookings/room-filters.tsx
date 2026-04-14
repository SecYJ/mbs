import { Filter, Monitor, Users, MapPin, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const EQUIPMENT_OPTIONS = [
	"Projector",
	"Video Conferencing",
	"Whiteboard",
	"TV Screen",
	"Speakerphone",
] as const;

const LOCATION_OPTIONS = [
	"3rd Floor East",
	"3rd Floor West",
	"4th Floor East",
	"4th Floor West",
	"5th Floor",
] as const;

interface RoomFiltersProps {
	open: boolean;
	onClose: () => void;
}

export function RoomFilters({ open, onClose }: RoomFiltersProps) {
	const [capacity, setCapacity] = useState<string>("");
	const [location, setLocation] = useState<string>("");
	const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

	const activeFilterCount =
		(capacity ? 1 : 0) + (location ? 1 : 0) + selectedEquipment.length;

	function toggleEquipment(item: string) {
		setSelectedEquipment((prev) =>
			prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
		);
	}

	function clearAll() {
		setCapacity("");
		setLocation("");
		setSelectedEquipment([]);
	}

	if (!open) return null;

	return (
		<div className="flex w-[280px] shrink-0 flex-col border-l border-[var(--border-grid)] bg-[var(--bg-base)]">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-[var(--border-grid)] px-5 py-4">
				<div className="flex items-center gap-2">
					<Filter size={15} className="text-[var(--text-secondary)]" strokeWidth={1.6} />
					<span className="text-sm font-semibold text-[var(--text-primary)]">Filters</span>
					{activeFilterCount > 0 && (
						<Badge
							variant="secondary"
							className="h-5 rounded-full bg-[rgba(16,185,129,0.12)] px-1.5 text-[10px] font-bold text-[var(--accent-green)]"
						>
							{activeFilterCount}
						</Badge>
					)}
				</div>
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={onClose}
					className="text-[var(--text-tertiary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-secondary)]"
				>
					<X size={14} />
				</Button>
			</div>

			{/* Filter sections */}
			<div className="flex-1 overflow-y-auto px-5 py-5">
				{/* Capacity */}
				<div className="space-y-2.5">
					<label className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
						<Users size={13} strokeWidth={1.6} />
						Capacity
					</label>
					<Select value={capacity} onValueChange={setCapacity}>
						<SelectTrigger className="h-9 border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-sm text-[var(--text-secondary)] focus:ring-[rgba(16,185,129,0.2)]">
							<SelectValue placeholder="Any capacity" />
						</SelectTrigger>
						<SelectContent className="border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
							<SelectItem value="2">2+ people</SelectItem>
							<SelectItem value="4">4+ people</SelectItem>
							<SelectItem value="6">6+ people</SelectItem>
							<SelectItem value="8">8+ people</SelectItem>
							<SelectItem value="10">10+ people</SelectItem>
							<SelectItem value="20">20+ people</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<Separator className="my-5 bg-[rgba(255,255,255,0.04)]" />

				{/* Location */}
				<div className="space-y-2.5">
					<label className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
						<MapPin size={13} strokeWidth={1.6} />
						Location
					</label>
					<Select value={location} onValueChange={setLocation}>
						<SelectTrigger className="h-9 border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-sm text-[var(--text-secondary)] focus:ring-[rgba(16,185,129,0.2)]">
							<SelectValue placeholder="Any location" />
						</SelectTrigger>
						<SelectContent className="border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
							{LOCATION_OPTIONS.map((loc) => (
								<SelectItem key={loc} value={loc}>
									{loc}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Separator className="my-5 bg-[rgba(255,255,255,0.04)]" />

				{/* Equipment */}
				<div className="space-y-3">
					<label className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
						<Monitor size={13} strokeWidth={1.6} />
						Equipment
					</label>
					<div className="flex flex-wrap gap-2">
						{EQUIPMENT_OPTIONS.map((item) => {
							const isSelected = selectedEquipment.includes(item);
							return (
								<button
									key={item}
									type="button"
									onClick={() => toggleEquipment(item)}
									className={cn(
										"cursor-pointer rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
										isSelected
											? "border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.08)] text-[#34d399]"
											: "border-[var(--border-grid)] bg-transparent text-[var(--text-tertiary)] hover:border-[var(--border-subtle)] hover:text-[var(--text-secondary)]"
									)}
								>
									{item}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* Footer */}
			{activeFilterCount > 0 && (
				<div className="border-t border-[var(--border-grid)] px-5 py-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={clearAll}
						className="w-full text-xs text-[var(--text-tertiary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-secondary)]"
					>
						Clear all filters
					</Button>
				</div>
			)}
		</div>
	);
}
