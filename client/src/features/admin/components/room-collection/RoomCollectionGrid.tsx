import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, MapPin, UsersRound, XCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { Room } from "@/features/admin/types";
import { cn } from "@/lib/utils";

export const RoomCollectionGrid = ({ rooms }: { rooms: Room[] }) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
        {rooms.map((room) => (
            <Link
                key={room.id}
                to="/admin/rooms/$roomId"
                params={{ roomId: room.id }}
                className={cn(
                    "group block min-h-36 overflow-hidden rounded-lg border border-(--a-border) bg-(--a-surface-0) p-4 text-left no-underline shadow-sm transition-[border-color,transform,background-color] duration-150 hover:-translate-y-0.5 hover:border-(--a-border-hover)",
                    !room.active && "opacity-55 hover:opacity-75",
                )}
            >
                <div className="mb-2.5 flex min-w-0 items-start justify-between gap-3 border-b border-(--a-border) pb-2.5">
                    <div className="min-w-0">
                        <div className="truncate text-[1.25rem] font-semibold text-(--a-text)">{room.name}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[0.75rem] text-(--a-text-secondary)">
                            <MapPin className="size-3 shrink-0" strokeWidth={1.7} />
                            <span className="truncate">{room.location}</span>
                        </div>
                    </div>
                    <RoomCollectionStatusBadge active={room.active} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-(--a-text-secondary)">
                    <RoomCollectionCardStat icon={UsersRound} label="Seats" value={room.capacity} />
                    <RoomCollectionCardStat
                        icon={Clock}
                        label="Max booking"
                        value={`${room.maxBookingDurationHours}h`}
                    />
                </div>
            </Link>
        ))}
    </div>
);

const RoomCollectionStatusBadge = ({ active }: { active: boolean }) => (
    <span
        className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium",
            active ? "bg-(--a-success-subtle) text-(--a-success)" : "bg-(--a-surface-2) text-(--a-text-muted)",
        )}
    >
        {active ? (
            <CheckCircle2 className="size-3" strokeWidth={1.8} />
        ) : (
            <XCircle className="size-3" strokeWidth={1.8} />
        )}
        {active ? "Available" : "Disabled"}
    </span>
);

const RoomCollectionCardStat = ({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: ReactNode;
}) => (
    <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[0.6875rem] text-(--a-text-muted) uppercase">
            <Icon className="size-3 shrink-0" strokeWidth={1.7} />
            <span className="truncate">{label}</span>
        </div>
        <div className="mt-1 truncate text-[0.875rem] font-medium text-(--a-text)">{value}</div>
    </div>
);
