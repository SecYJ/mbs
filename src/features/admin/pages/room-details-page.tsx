import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Package, RotateCcw, Save, UsersRound } from "lucide-react";
import { Controller, FormStateSubscribe } from "react-hook-form";

import { adminInputClasses } from "@/features/admin/admin-classes";
import { EmptyState } from "@/features/admin/components/EmptyState";
import { StatusToggle } from "@/features/admin/components/status-toggle";
import { useUpdateRoom } from "@/features/admin/hooks/useUpdateRoom";
import { roomsSearchDefaults } from "@/features/admin/schema/rooms-search.schema";
import { roomQueryOptions } from "@/features/admin/services/rooms/queries";
import type { Room } from "@/features/admin/types";
import { cn } from "@/lib/utils";

const MAX_BOOKING_DURATION_HOURS_LIMIT = 24;

export const RoomDetailsPage = () => {
    const roomId = useParams({
        from: "/admin/rooms_/$roomId",
        select(s) {
            return s.roomId;
        },
    });
    const { data: room } = useSuspenseQuery(roomQueryOptions(roomId));

    if (!room) {
        return (
            <div className="p-6">
                <EmptyState
                    icon={Package}
                    title="Room not found"
                    description="This room may have been removed or the link may be outdated."
                />
                <div className="mt-5 flex justify-center">
                    <BackToRoomsLink label="Back to rooms" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-5 flex flex-col gap-4 border-b border-(--a-border) pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <BackToRoomsLink label="Rooms" />
                    <h2 className="mt-3 truncate text-[1.5rem] font-bold tracking-tight text-(--a-text)">
                        {room.name}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-(--a-text-muted)">
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                            <MapPin className="size-3.5 shrink-0" strokeWidth={1.7} />
                            <span className="truncate">{room.location}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <UsersRound className="size-3.5" strokeWidth={1.7} />
                            {room.capacity} seats
                        </span>
                    </div>
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-(--a-surface-2) px-2.5 py-1 text-[0.75rem] font-semibold text-(--a-text-secondary)">
                    {room.active ? "Available" : "Disabled"}
                </span>
            </div>

            <div className="space-y-5">
                <RoomDetailsEditor room={room} />
                <RoomEquipmentSection room={room} />
            </div>
        </div>
    );
};

const BackToRoomsLink = ({ label }: { label: string }) => (
    <Link
        to="/admin/rooms"
        search={roomsSearchDefaults}
        className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-surface-2) px-3 py-1.5 text-xs font-semibold text-(--a-text-secondary) no-underline transition-colors hover:text-(--a-text)"
    >
        <ArrowLeft className="size-3.5" strokeWidth={2} />
        {label}
    </Link>
);

const RoomEquipmentSection = ({ room }: { room: Room }) => (
    <section className="rounded-lg border border-(--a-border) bg-(--a-surface-0) p-4">
        <div className="mb-3 flex items-center gap-1.5 text-[0.75rem] font-semibold tracking-wider text-(--a-text-muted) uppercase">
            <Package className="size-3.5" strokeWidth={1.6} />
            Equipment
            <span className="ml-1 text-[0.6875rem] font-medium tracking-normal text-(--a-text-muted) normal-case">
                ({room.equipment.length})
            </span>
        </div>
        <RoomEquipmentList room={room} />
    </section>
);

const RoomEquipmentList = ({ room }: { room: Room }) => {
    if (room.equipment.length === 0) {
        return <p className="text-[0.75rem] text-(--a-text-muted)">No equipment assigned to this room.</p>;
    }

    return (
        <ul className="grid gap-2 sm:grid-cols-2">
            {room.equipment.map((item) => (
                <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-(--a-border) bg-(--a-bg) px-3 py-2"
                >
                    <div className="min-w-0">
                        <div className="truncate text-[0.8125rem] font-medium text-(--a-text)">{item.name}</div>
                        <div className="mt-0.5 truncate text-[0.6875rem] text-(--a-text-muted)">
                            {item.brand} - {item.model}
                        </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-(--a-surface-2) px-2 py-0.5 text-[0.6875rem] font-semibold text-(--a-text-secondary) tabular-nums">
                        x {item.quantity}
                    </span>
                </li>
            ))}
        </ul>
    );
};

const RoomDetailsEditor = ({ room }: { room: Room }) => {
    const { form, onSubmit, isPending } = useUpdateRoom({
        roomId: room.id,
        name: room.name,
        location: room.location,
        capacity: room.capacity,
        maxBookingDurationHours: room.maxBookingDurationHours,
        available: room.active,
    });

    return (
        <form onSubmit={onSubmit} noValidate className="rounded-lg border border-(--a-border) bg-(--a-surface-1) p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]">
                <Controller
                    control={form.control}
                    name="name"
                    render={({ field, fieldState: { error } }) => (
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label
                                htmlFor={`room-name-${room.id}`}
                                className="mb-1.5 block text-[0.6875rem] font-semibold tracking-wider text-(--a-text-muted) uppercase"
                            >
                                Room name
                            </label>
                            <input
                                {...field}
                                id={`room-name-${room.id}`}
                                aria-label="Room name"
                                className={cn(adminInputClasses, "w-full")}
                            />
                            {error ? (
                                <p className="mt-1.5 text-[0.6875rem] text-(--a-danger)">{error.message}</p>
                            ) : null}
                        </div>
                    )}
                />
                <Controller
                    control={form.control}
                    name="location"
                    render={({ field, fieldState: { error } }) => (
                        <div>
                            <label
                                htmlFor={`room-location-${room.id}`}
                                className="mb-1.5 block text-[0.6875rem] font-semibold tracking-wider text-(--a-text-muted) uppercase"
                            >
                                Location
                            </label>
                            <input
                                {...field}
                                id={`room-location-${room.id}`}
                                aria-label="Room location"
                                className={cn(adminInputClasses, "w-full")}
                            />
                            {error ? (
                                <p className="mt-1.5 text-[0.6875rem] text-(--a-danger)">{error.message}</p>
                            ) : null}
                        </div>
                    )}
                />
                <Controller
                    control={form.control}
                    name="capacity"
                    render={({ field, fieldState: { error } }) => (
                        <div>
                            <label
                                htmlFor={`room-capacity-${room.id}`}
                                className="mb-1.5 block text-[0.6875rem] font-semibold tracking-wider text-(--a-text-muted) uppercase"
                            >
                                Capacity
                            </label>
                            <input
                                id={`room-capacity-${room.id}`}
                                aria-label="Room capacity"
                                type="number"
                                min={1}
                                value={Number.isFinite(field.value) ? field.value : ""}
                                onChange={(e) =>
                                    field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
                                }
                                onBlur={field.onBlur}
                                className={cn(adminInputClasses, "w-24 text-center tabular-nums")}
                            />
                            {error ? (
                                <p className="mt-1.5 text-[0.6875rem] text-(--a-danger)">{error.message}</p>
                            ) : null}
                        </div>
                    )}
                />
                <Controller
                    control={form.control}
                    name="maxBookingDurationHours"
                    render={({ field, fieldState: { error } }) => (
                        <div>
                            <label
                                htmlFor={`room-max-booking-duration-${room.id}`}
                                className="mb-1.5 block text-[0.6875rem] font-semibold tracking-wider text-(--a-text-muted) uppercase"
                            >
                                Max duration
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
                                    className={cn(adminInputClasses, "w-24 text-center tabular-nums")}
                                />
                                <span className="text-[0.75rem] font-medium text-(--a-text-muted)">
                                    hours per booking
                                </span>
                            </div>
                            {error ? (
                                <p className="mt-1.5 text-[0.6875rem] text-(--a-danger)">{error.message}</p>
                            ) : null}
                        </div>
                    )}
                />
            </div>
            <Controller
                control={form.control}
                name="available"
                render={({ field }) => (
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-(--a-border) bg-(--a-surface-0) px-3.5 py-3">
                        <div className="min-w-0">
                            <p className="text-[0.8125rem] font-semibold text-(--a-text)">Available for booking</p>
                            <p className="mt-0.5 text-[0.6875rem] text-(--a-text-muted)">
                                Disable to hide from booking flows.
                            </p>
                        </div>
                        <StatusToggle checked={field.value} onChange={field.onChange} label="Room availability" />
                    </div>
                )}
            />
            <FormStateSubscribe
                control={form.control}
                render={({ errors, isDirty }) => (
                    <div className="mt-4 flex flex-col gap-3 border-t border-(--a-border) pt-4 sm:flex-row sm:items-center sm:justify-between">
                        {errors.root?.message ? (
                            <p className="text-[0.6875rem] text-(--a-danger)">{errors.root.message}</p>
                        ) : null}
                        <div className="flex items-center gap-2 sm:ml-auto">
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
