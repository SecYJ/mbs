import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Controller, FormStateSubscribe } from "react-hook-form";
import { Clock, MapPin, Package, RotateCcw, Save, UsersRound, X } from "lucide-react";

import { adminInputClasses } from "@/features/admin/admin-classes";
import { useUpdateRoomBookingRules } from "@/features/admin/hooks/useUpdateRoomBookingRules";
import type { Room } from "@/features/admin/types";

const MAX_BOOKING_DURATION_HOURS_LIMIT = 24;

type RoomDetailsDrawerProps = {
    room: Room | null;
    onClose: () => void;
};

export const RoomDetailsDrawer = ({ room, onClose }: RoomDetailsDrawerProps) => {
    return (
        <DialogPrimitive.Root open={!!room} onOpenChange={(open) => !open && onClose()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Backdrop className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
                {room ? (
                    <DialogPrimitive.Popup className="admin-shell fixed right-0 bottom-0 left-0 z-50 max-h-[min(92vh,760px)] overflow-hidden rounded-t-xl border border-(--a-border-hover) bg-(--a-surface-0) text-(--a-text) shadow-2xl outline-none transition-[opacity,transform] duration-300 ease-out data-ending-style:translate-y-full data-ending-style:opacity-0 data-starting-style:translate-y-full data-starting-style:opacity-0 sm:top-0 sm:bottom-0 sm:left-auto sm:h-full sm:max-h-none sm:w-[min(440px,calc(100vw-2rem))] sm:rounded-t-none sm:rounded-l-xl sm:data-ending-style:translate-x-full sm:data-ending-style:translate-y-0 sm:data-starting-style:translate-x-full sm:data-starting-style:translate-y-0">
                        <div className="flex h-full min-h-0 flex-col">
                            <div className="flex items-start justify-between gap-4 border-b border-(--a-border) px-5 py-4">
                                <div className="min-w-0">
                                    <DialogPrimitive.Title className="truncate text-[1rem] font-bold tracking-tight text-(--a-text)">
                                        {room.name}
                                    </DialogPrimitive.Title>
                                    <DialogPrimitive.Description className="mt-1 flex flex-wrap items-center gap-2 text-[0.75rem] text-(--a-text-muted)">
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin className="size-3" strokeWidth={1.7} />
                                            {room.location}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <UsersRound className="size-3" strokeWidth={1.7} />
                                            {room.capacity} seats
                                        </span>
                                    </DialogPrimitive.Description>
                                </div>
                                <DialogPrimitive.Close className="flex size-8 shrink-0 items-center justify-center rounded-lg text-(--a-text-muted) transition-colors hover:bg-(--a-surface-2) hover:text-(--a-text)">
                                    <X className="size-4" strokeWidth={2} />
                                    <span className="sr-only">Close room details</span>
                                </DialogPrimitive.Close>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                                <div className="grid grid-cols-2 gap-3">
                                    <RoomDetailStat label="Status" value={room.active ? "Available" : "Disabled"} />
                                    <RoomDetailStat label="Capacity" value={`${room.capacity}`} />
                                    <RoomDetailStat label="Location" value={room.location} />
                                    <RoomDetailStat label="Max duration" value={`${room.maxBookingDurationHours}h`} />
                                </div>

                                <div className="mt-5 rounded-lg border border-(--a-border) bg-(--a-surface-1) p-4">
                                    <RoomBookingRulesEditor room={room} />
                                </div>

                                <div className="mt-5 border-t border-(--a-border) pt-4">
                                    <div className="mb-2 flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-wider text-(--a-text-muted) uppercase">
                                        <Package className="size-3" strokeWidth={1.6} />
                                        Equipment
                                        <span className="ml-1 text-[0.625rem] font-medium tracking-normal text-(--a-text-muted) normal-case">
                                            ({room.equipment.length})
                                        </span>
                                    </div>
                                    {room.equipment.length === 0 ? (
                                        <p className="text-[0.75rem] text-(--a-text-muted)">
                                            No equipment assigned to this room.
                                        </p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {room.equipment.map((item) => (
                                                <li
                                                    key={item.id}
                                                    className="flex items-center justify-between gap-3 rounded-md border border-(--a-border) bg-(--a-bg) px-3 py-2"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="truncate text-[0.8125rem] font-medium text-(--a-text)">
                                                            {item.name}
                                                        </div>
                                                        <div className="mt-0.5 truncate text-[0.6875rem] text-(--a-text-muted)">
                                                            {item.brand} · {item.model}
                                                        </div>
                                                    </div>
                                                    <span className="shrink-0 rounded-md bg-(--a-surface-2) px-2 py-0.5 text-[0.6875rem] font-semibold text-(--a-text-secondary) tabular-nums">
                                                        × {item.quantity}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogPrimitive.Popup>
                ) : null}
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};

const RoomDetailStat = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-lg border border-(--a-border) bg-(--a-surface-1) px-3 py-2.5">
        <div className="text-[0.625rem] font-semibold tracking-wider text-(--a-text-muted) uppercase">{label}</div>
        <div className="mt-1 truncate text-[0.8125rem] font-semibold text-(--a-text)">{value}</div>
    </div>
);

const RoomBookingRulesEditor = ({ room }: { room: Room }) => {
    const { form, onSubmit, isPending } = useUpdateRoomBookingRules({
        roomId: room.id,
        maxBookingDurationHours: room.maxBookingDurationHours,
    });

    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <Controller
                control={form.control}
                name="maxBookingDurationHours"
                render={({ field, fieldState: { error } }) => (
                    <div>
                        <label
                            htmlFor={`drawer-room-max-booking-duration-${room.id}`}
                            className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-wider text-(--a-text-muted) uppercase"
                        >
                            <Clock className="size-3" strokeWidth={1.6} />
                            Max Booking Duration
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                id={`drawer-room-max-booking-duration-${room.id}`}
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
