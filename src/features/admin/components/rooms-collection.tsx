import type { ReactNode } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Building2, Clock, Grid2X2, List, MapPin, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/features/admin/components/empty-state";
import { RoomsEmptyStateCreateButton } from "@/features/admin/components/empty-state-create-button";
import { RoomDetailsDrawer } from "@/features/admin/components/room-details-drawer";
import type { RoomsSearch } from "@/features/admin/schema/rooms-search.schema";
import { roomQueryOptions, roomsQueryOptions } from "@/features/admin/services/rooms/queries";
import type { Room } from "@/features/admin/types";

const statusItems: Array<{ label: string; value: RoomsSearch["status"] }> = [
    { label: "All rooms", value: "all" },
    { label: "Available", value: "available" },
    { label: "Disabled", value: "disabled" },
];

const sortItems: Array<{ label: string; value: NonNullable<RoomsSearch["sort"]> }> = [
    { label: "Most recent", value: "recent" },
    { label: "Name A-Z", value: "name-asc" },
    { label: "Name Z-A", value: "name-desc" },
    { label: "Capacity high", value: "capacity-desc" },
    { label: "Capacity low", value: "capacity-asc" },
    { label: "Duration high", value: "duration-desc" },
    { label: "Duration low", value: "duration-asc" },
];

type RoomsSearchUpdate = Partial<RoomsSearch>;

export const RoomsCollection = () => {
    const search = useSearch({ from: "/admin/rooms" });
    const navigate = useNavigate({ from: "/admin/rooms" });
    const { data: rooms } = useSuspenseQuery(roomsQueryOptions(search));
    const { data: selectedRoom } = useSuspenseQuery(roomQueryOptions(search.selected));

    const updateSearch = (next: RoomsSearchUpdate) => {
        navigate({
            search: (prev) => ({ ...prev, ...next }),
            replace: true,
        });
    };

    const selectRoom = (roomId: string) => updateSearch({ selected: roomId });
    const closeDrawer = () => updateSearch({ selected: undefined });

    if (rooms.length === 0 && !search.q && search.status === "all") {
        return (
            <div className="p-6">
                <EmptyState
                    icon={Building2}
                    title="No rooms yet"
                    description="Create your first meeting room to get started with the booking system."
                    action={<RoomsEmptyStateCreateButton />}
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <RoomsCollectionToolbar search={search} resultCount={rooms.length} onSearchChange={updateSearch} />

            {rooms.length === 0 ? (
                <p className="py-12 text-center text-sm text-(--a-text-muted)">No rooms match these filters.</p>
            ) : search.view === "list" ? (
                <RoomList rooms={rooms} selectedRoomId={search.selected} onSelectRoom={selectRoom} />
            ) : (
                <RoomGrid rooms={rooms} selectedRoomId={search.selected} onSelectRoom={selectRoom} />
            )}

            <RoomDetailsDrawer room={selectedRoom} onClose={closeDrawer} />
        </div>
    );
};

const RoomsCollectionToolbar = ({
    search,
    resultCount,
    onSearchChange,
}: {
    search: RoomsSearch;
    resultCount: number;
    onSearchChange: (next: RoomsSearchUpdate) => void;
}) => (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
            <h2 className="text-[0.9375rem] font-semibold tracking-tight text-(--a-text)">Room collection</h2>
            <p className="mt-1 text-[0.75rem] text-(--a-text-muted)">
                {resultCount} {resultCount === 1 ? "room" : "rooms"}
            </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
            <AdminSelect
                label="Status"
                value={search.status}
                items={statusItems}
                onValueChange={(status) => onSearchChange({ status, selected: undefined })}
            />
            <AdminSelect
                label="Sort rooms"
                value={search.sort ?? "recent"}
                items={sortItems}
                onValueChange={(sort) => onSearchChange({ sort, selected: undefined })}
            />
            <div className="inline-flex rounded-lg border border-(--a-border-hover) bg-(--a-bg) p-1">
                <ViewToggleButton
                    active={search.view === "grid"}
                    label="Grid view"
                    onClick={() => onSearchChange({ view: "grid" })}
                >
                    <Grid2X2 className="size-3.5" strokeWidth={2} />
                </ViewToggleButton>
                <ViewToggleButton
                    active={search.view === "list"}
                    label="List view"
                    onClick={() => onSearchChange({ view: "list" })}
                >
                    <List className="size-3.5" strokeWidth={2} />
                </ViewToggleButton>
            </div>
        </div>
    </div>
);

const AdminSelect = <TValue extends string>({
    label,
    value,
    items,
    onValueChange,
}: {
    label: string;
    value: TValue;
    items: Array<{ label: string; value: TValue }>;
    onValueChange: (value: TValue) => void;
}) => (
    <Select
        value={value}
        onValueChange={(nextValue) => {
            if (nextValue !== null) onValueChange(nextValue);
        }}
        items={items}
    >
        <SelectTrigger
            aria-label={label}
            size="sm"
            className="h-9 rounded-lg border-(--a-border-hover) bg-(--a-bg) px-3 text-[0.8125rem] text-(--a-text) shadow-none hover:bg-(--a-surface-1) focus-visible:border-(--a-accent-border) focus-visible:ring-(--a-accent-subtle) [&>svg]:text-(--a-text-muted)"
        >
            <SelectValue />
        </SelectTrigger>
        <SelectContent
            align="end"
            className="admin-shell min-w-40 border-(--a-border-hover) bg-(--a-surface-0) text-(--a-text)"
        >
            {items.map((item) => (
                <SelectItem
                    key={item.value}
                    value={item.value}
                    className="text-[0.8125rem] text-(--a-text) data-[highlighted]:bg-(--a-surface-2) data-[highlighted]:text-(--a-text)"
                >
                    {item.label}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);

const ViewToggleButton = ({
    active,
    label,
    children,
    onClick,
}: {
    active: boolean;
    label: string;
    children: ReactNode;
    onClick: () => void;
}) => (
    <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        className={cn(
            "flex size-7 items-center justify-center rounded-md text-(--a-text-muted) transition-colors hover:text-(--a-text)",
            active && "bg-(--a-surface-2) text-(--a-text)",
        )}
    >
        {children}
    </button>
);

const RoomGrid = ({
    rooms,
    selectedRoomId,
    onSelectRoom,
}: {
    rooms: Room[];
    selectedRoomId?: string;
    onSelectRoom: (roomId: string) => void;
}) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
        {rooms.map((room) => (
            <RoomCard
                key={room.id}
                room={room}
                selected={selectedRoomId === room.id}
                onClick={() => onSelectRoom(room.id)}
            />
        ))}
    </div>
);

const RoomCard = ({ room, selected, onClick }: { room: Room; selected: boolean; onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "group min-h-36 overflow-hidden rounded-lg border border-(--a-border) bg-(--a-surface-0) text-left shadow-sm transition-[border-color,transform,background-color] duration-150 hover:-translate-y-0.5 hover:border-(--a-border-hover)",
            selected && "border-(--a-accent-border)",
            !room.active && "opacity-55 hover:opacity-75",
        )}
    >
        <div className="relative flex h-20 items-end overflow-hidden border-b border-(--a-border) bg-(--a-surface-1) px-3 py-3">
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_18px_18px,rgba(255,255,255,0.22)_1px,transparent_1px)] RoomsCollection" />
            <span className="relative flex size-8 items-center justify-center rounded-lg bg-(--a-surface-2) text-[0.875rem] font-bold text-(--a-text) ring-1 ring-(--a-border-hover)">
                {room.name.slice(0, 1).toUpperCase()}
            </span>
        </div>
        <div className="space-y-2 px-3 py-3">
            <div className="truncate text-[0.9375rem] font-semibold text-(--a-text)">{room.name}</div>
            <div className="flex items-center gap-1.5 text-[0.75rem] text-(--a-text-secondary)">
                <MapPin className="size-3 shrink-0" strokeWidth={1.7} />
                <span className="truncate">{room.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[0.75rem] text-(--a-text-secondary)">
                <UsersRound className="size-3 shrink-0" strokeWidth={1.7} />
                <span>{room.capacity} seats</span>
            </div>
        </div>
    </button>
);

const RoomList = ({
    rooms,
    selectedRoomId,
    onSelectRoom,
}: {
    rooms: Room[];
    selectedRoomId?: string;
    onSelectRoom: (roomId: string) => void;
}) => (
    <div className="overflow-hidden rounded-lg border border-(--a-border) bg-(--a-surface-0)">
        {rooms.map((room) => (
            <button
                key={room.id}
                type="button"
                onClick={() => onSelectRoom(room.id)}
                className={cn(
                    "flex w-full items-center justify-between gap-4 border-b border-(--a-border) px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-(--a-surface-1)",
                    selectedRoomId === room.id && "bg-(--a-surface-1)",
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
                            className="size-1.5 rounded-full"
                            style={{ background: room.active ? "var(--a-success)" : "var(--a-text-muted)" }}
                        />
                        {room.active ? "Available" : "Disabled"}
                    </span>
                </div>
            </button>
        ))}
    </div>
);
