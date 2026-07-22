import { Link } from "@tanstack/react-router";
import { Clock, MapPin, UsersRound } from "lucide-react";

import type { Room } from "@/features/admin/types";
import { cn } from "@/lib/utils";

export const RoomCollectionList = ({ rooms }: { rooms: Room[] }) => (
    <div className="overflow-hidden rounded-lg border border-(--a-border) bg-(--a-surface-0)">
        {rooms.map((room) => (
            <Link
                key={room.id}
                to="/admin/rooms/$roomId"
                params={{ roomId: room.id }}
                className={cn(
                    "flex w-full items-center justify-between gap-4 border-b border-(--a-border) px-4 py-3 text-left no-underline transition-colors last:border-b-0 hover:bg-(--a-surface-1)",
                    !room.active && "opacity-55 hover:opacity-75",
                )}
            >
                <div className="min-w-0">
                    <div className="truncate text-[0.875rem] font-semibold text-(--a-text)">{room.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-(--a-text-secondary)">
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                            <MapPin className="size-3 shrink-0" strokeWidth={1.7} />
                            <span className="truncate">{room.location}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <UsersRound className="size-3" strokeWidth={1.7} />
                            {room.capacity} seats
                        </span>
                    </div>
                </div>
                <div className="hidden shrink-0 items-center gap-4 text-[0.75rem] text-(--a-text-muted) sm:flex">
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <Clock className="size-3" strokeWidth={1.7} />
                        {room.maxBookingDurationHours}h
                    </span>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <span
                            className={cn(
                                "size-1.5 rounded-full",
                                room.active ? "bg-(--a-success)" : "bg-(--a-text-muted)",
                            )}
                        />
                        {room.active ? "Available" : "Disabled"}
                    </span>
                </div>
            </Link>
        ))}
    </div>
);
