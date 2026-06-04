import { Controller, FormStateSubscribe } from "react-hook-form";
import { ChevronDown, ChevronUp, Clock, MapPin, Package, RotateCcw, Save, UsersRound } from "lucide-react";

import { adminExpandRowClasses, adminInputClasses } from "@/features/admin/admin-classes";
import { useUpdateRoomBookingRules } from "@/features/admin/hooks/useUpdateRoomBookingRules";
import type { Room } from "@/features/admin/types";

const MAX_BOOKING_DURATION_HOURS_LIMIT = 24;

type Props = {
    room: Room;
    isExpanded: boolean;
    onToggleExpand: () => void;
};

export const RoomRow = ({ room, isExpanded, onToggleExpand }: Props) => {
    return (
        <>
            <tr data-disabled={!room.active || undefined}>
                <td>
                    <button
                        type="button"
                        onClick={onToggleExpand}
                        aria-expanded={isExpanded}
                        aria-label={`${room.name} — toggle details`}
                        className="flex w-full items-center gap-2 text-left"
                    >
                        <span className="font-semibold text-(--a-text)">{room.name}</span>
                        {isExpanded ? (
                            <ChevronUp className="size-3.5 text-(--a-text-muted)" />
                        ) : (
                            <ChevronDown className="size-3.5 text-(--a-text-muted)" />
                        )}
                    </button>
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
                <td>
                    <span className="tabular-nums flex items-center gap-1.5 text-(--a-text-secondary)">
                        <Clock className="size-3" strokeWidth={1.6} />
                        {room.maxBookingDurationHours}h
                    </span>
                </td>
                <td>
                    <span
                        className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium"
                        style={{
                            color: room.active ? "var(--a-success)" : "var(--a-text-muted)",
                        }}
                    >
                        <span
                            className="size-1.5 rounded-full"
                            style={{
                                background: room.active ? "var(--a-success)" : "var(--a-text-muted)",
                            }}
                        />
                        {room.active ? "Available" : "Disabled"}
                    </span>
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
                                            aria-label="Room name"
                                            readOnly
                                            className={`${adminInputClasses} w-full`}
                                            value={room.name}
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
                                            aria-label="Room location"
                                            readOnly
                                            className={`${adminInputClasses} w-full`}
                                            value={room.location}
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
                                            aria-label="Room capacity"
                                            type="number"
                                            readOnly
                                            className={`${adminInputClasses} w-24`}
                                            value={room.capacity}
                                        />
                                    </div>
                                    <RoomBookingRulesEditor room={room} />
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

                            <div className="mt-5 flex items-center justify-end gap-3 border-t border-(--a-border) pt-4">
                                <button
                                    type="button"
                                    onClick={onToggleExpand}
                                    className="rounded-lg bg-(--a-surface-2) px-4 py-1.5 text-xs font-medium text-(--a-text-secondary) transition-colors hover:text-(--a-text)"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

const RoomBookingRulesEditor = ({ room }: { room: Room }) => {
    const { form, onSubmit, isPending } = useUpdateRoomBookingRules({
        roomId: room.id,
        maxBookingDurationHours: room.maxBookingDurationHours,
    });

    return (
        <form onSubmit={onSubmit} className="space-y-2">
            <Controller
                control={form.control}
                name="maxBookingDurationHours"
                render={({ field, fieldState: { error } }) => (
                    <div>
                        <label
                            htmlFor={`room-max-booking-duration-${room.id}`}
                            className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)"
                        >
                            <Clock className="size-3" strokeWidth={1.6} />
                            Max Booking Duration
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                id={`room-max-booking-duration-${room.id}`}
                                aria-label="Maximum booking duration"
                                type="number"
                                min={1}
                                max={MAX_BOOKING_DURATION_HOURS_LIMIT}
                                value={Number.isFinite(field.value) ? field.value : ""}
                                onChange={(e) =>
                                    field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
                                }
                                onBlur={field.onBlur}
                                className={`${adminInputClasses} w-24 text-center tabular-nums`}
                            />
                            <span className="text-[0.75rem] font-medium text-(--a-text-muted)">hours per booking</span>
                        </div>
                        {error ? <p className="mt-1.5 text-[0.6875rem] text-(--a-danger)">{error.message}</p> : null}
                    </div>
                )}
            />
            <FormStateSubscribe
                control={form.control}
                render={({ errors, isDirty }) => (
                    <div className="space-y-2">
                        {errors.root?.message ? (
                            <p className="text-[0.6875rem] text-(--a-danger)">{errors.root.message}</p>
                        ) : null}
                        <div className="flex items-center gap-2">
                            {isDirty ? (
                                <button
                                    type="button"
                                    onClick={() => form.reset()}
                                    disabled={isPending}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-surface-2) px-3 py-1.5 text-xs font-medium text-(--a-text-secondary) transition-colors hover:text-(--a-text) disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <RotateCcw className="size-3" strokeWidth={2} />
                                    Reset
                                </button>
                            ) : null}
                            <button
                                type="submit"
                                disabled={!isDirty || isPending}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-accent) px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-(--a-accent-hover) disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Save className="size-3" strokeWidth={2} />
                                {isPending ? "Saving" : "Save"}
                            </button>
                        </div>
                    </div>
                )}
            />
        </form>
    );
};
