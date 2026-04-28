import { ChevronDown, ChevronUp, MapPin, MoreHorizontal, Package, Trash2, UsersRound } from "lucide-react";

import { adminExpandRowClasses, adminInputClasses } from "@/features/admin/admin-classes";
import { StatusToggle } from "@/features/admin/components/status-toggle";

export interface RoomEquipmentLine {
    id: string;
    name: string;
    brand: string;
    model: string;
    quantity: number;
}

export interface Room {
    id: string;
    name: string;
    location: string;
    capacity: number;
    active: boolean;
    equipment: RoomEquipmentLine[];
}

type Props = {
    room: Room;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onToggleActive: () => void;
};

export const RoomRow = ({ room, isExpanded, onToggleExpand, onToggleActive }: Props) => {
    return (
        <>
            <tr className="cursor-pointer" onClick={onToggleExpand} data-disabled={!room.active || undefined}>
                <td>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-(--a-text)">{room.name}</span>
                        {isExpanded ? (
                            <ChevronUp className="size-3.5 text-(--a-text-muted)" />
                        ) : (
                            <ChevronDown className="size-3.5 text-(--a-text-muted)" />
                        )}
                    </div>
                </td>
                <td>
                    <span className="flex items-center gap-1.5 text-(--a-text-secondary)">
                        <MapPin className="size-3" strokeWidth={1.6} />
                        {room.location}
                    </span>
                </td>
                <td>
                    <span className="tabular-nums flex items-center gap-1.5 text-(--a-text-secondary)">
                        <UsersRound className="size-3" strokeWidth={1.6} />
                        {room.capacity}
                    </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                    <StatusToggle checked={room.active} onChange={onToggleActive} label={`${room.name} status`} />
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-md text-(--a-text-muted) transition-colors hover:bg-(--a-surface-2)"
                    >
                        <MoreHorizontal className="size-4" />
                    </button>
                </td>
            </tr>

            {isExpanded && (
                <tr>
                    <td colSpan={5} className="border-b border-(--a-border) bg-(--a-surface-1) p-0">
                        <div className={`${adminExpandRowClasses} px-6 py-5`}>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor={`room-name-${room.id}`}
                                            className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)"
                                        >
                                            Room Name
                                        </label>
                                        <input
                                            id={`room-name-${room.id}`}
                                            className={`${adminInputClasses} w-full`}
                                            defaultValue={room.name}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`room-location-${room.id}`}
                                            className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)"
                                        >
                                            Location
                                        </label>
                                        <input
                                            id={`room-location-${room.id}`}
                                            className={`${adminInputClasses} w-full`}
                                            defaultValue={room.location}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor={`room-capacity-${room.id}`}
                                            className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)"
                                        >
                                            Capacity
                                        </label>
                                        <input
                                            id={`room-capacity-${room.id}`}
                                            type="number"
                                            className={`${adminInputClasses} w-24`}
                                            defaultValue={room.capacity}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-(--a-border) pt-4">
                                <div className="mb-2 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)">
                                    <Package className="size-3" strokeWidth={1.6} />
                                    Equipment
                                    <span className="ml-1 text-[0.625rem] font-medium normal-case tracking-normal text-(--a-text-muted)">
                                        ({room.equipment.length})
                                    </span>
                                </div>
                                {room.equipment.length === 0 ? (
                                    <p className="text-[0.75rem] text-(--a-text-muted)">
                                        No equipment assigned to this room.
                                    </p>
                                ) : (
                                    <ul className="grid grid-cols-2 gap-2">
                                        {room.equipment.map((item) => (
                                            <li
                                                key={item.id}
                                                className="flex items-center justify-between gap-3 rounded-md border border-(--a-border) bg-(--a-surface-0) px-3 py-2"
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate text-[0.8125rem] font-medium text-(--a-text)">
                                                        {item.name}
                                                    </div>
                                                    <div className="mt-0.5 truncate text-[0.6875rem] text-(--a-text-muted)">
                                                        {item.brand} · {item.model}
                                                    </div>
                                                </div>
                                                <span className="shrink-0 rounded-md bg-(--a-surface-2) px-2 py-0.5 text-[0.6875rem] font-semibold tabular-nums text-(--a-text-secondary)">
                                                    × {item.quantity}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="mt-5 flex items-center gap-3 border-t border-(--a-border) pt-4">
                                <button
                                    type="button"
                                    className="rounded-lg bg-(--a-accent) px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-(--a-accent-hover)"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={onToggleExpand}
                                    className="rounded-lg bg-(--a-surface-2) px-4 py-1.5 text-xs font-medium text-(--a-text-secondary) transition-colors hover:text-(--a-text)"
                                >
                                    Cancel
                                </button>
                                <div className="flex-1" />
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-danger-subtle) px-3 py-1.5 text-xs font-medium text-(--a-danger) transition-colors"
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
};
