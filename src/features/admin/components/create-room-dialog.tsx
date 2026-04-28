"use client";

import { Controller, FormStateSubscribe } from "react-hook-form";
import { Building2, MapPin, UsersRound } from "lucide-react";
import type { ReactNode } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { adminInputClasses } from "@/features/admin/admin-classes";
import { StatusToggle } from "@/features/admin/components/status-toggle";
import { useAdminToast } from "@/features/admin/components/admin-layout";
import { useRoomsCreateStore } from "@/features/admin/stores/rooms-create-store";
import { useCreateRoom } from "@/features/admin/hooks/useCreateRoom";

export const CreateRoomDialog = () => {
    const { toast } = useAdminToast();
    const open = useRoomsCreateStore((s) => s.open);
    const { setOpen } = useRoomsCreateStore((s) => s.actions);

    const { form, onSubmit, isPending } = useCreateRoom({
        onSuccess: () => {
            toast("Room created", "success");
            setOpen(false);
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                showCloseButton={false}
                className="admin-shell border-0 bg-transparent p-0 shadow-none sm:max-w-[440px]"
            >
                <form
                    onSubmit={onSubmit}
                    noValidate
                    className="overflow-hidden rounded-xl border border-(--a-border-hover) bg-(--a-surface-0) text-(--a-text) shadow-2xl"
                >
                    <div className="flex items-center gap-3 border-b border-(--a-border) px-5 py-4">
                        <div
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                            style={{
                                background: "linear-gradient(135deg, var(--a-accent) 0%, #4f46e5 100%)",
                            }}
                        >
                            <Building2 className="size-4 text-white" strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-[0.9375rem] font-bold tracking-tight text-(--a-text)">
                                New Room
                            </DialogTitle>
                            <p className="mt-0.5 text-[0.6875rem] text-(--a-text-muted)">
                                Add a bookable space to the system.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5 px-5 py-5">
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field, fieldState: { error } }) => (
                                <Field label="Room Name" error={error?.message} inputId="create-room-name">
                                    <input
                                        {...field}
                                        id="create-room-name"
                                        className={`${adminInputClasses} w-full`}
                                        placeholder="Horizon Hall"
                                    />
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-[1fr_auto] gap-4">
                            <Controller
                                control={form.control}
                                name="location"
                                render={({ field, fieldState: { error } }) => (
                                    <Field
                                        label="Location"
                                        error={error?.message}
                                        inputId="create-room-location"
                                        icon={<MapPin className="size-3" strokeWidth={1.6} />}
                                    >
                                        <input
                                            {...field}
                                            id="create-room-location"
                                            className={`${adminInputClasses} w-full`}
                                            placeholder="3F East Wing"
                                        />
                                    </Field>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="capacity"
                                render={({ field, fieldState: { error } }) => (
                                    <Field
                                        label="Capacity"
                                        error={error?.message}
                                        inputId="create-room-capacity"
                                        icon={<UsersRound className="size-3" strokeWidth={1.6} />}
                                    >
                                        <input
                                            {...field}
                                            id="create-room-capacity"
                                            type="number"
                                            min={1}
                                            value={Number.isFinite(field.value) ? field.value : ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? undefined : e.target.valueAsNumber,
                                                )
                                            }
                                            className={`${adminInputClasses} w-24 text-center tabular-nums`}
                                        />
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            control={form.control}
                            name="available"
                            render={({ field }) => (
                                <div className="flex items-center justify-between gap-3 rounded-lg border border-(--a-border) bg-(--a-surface-1) px-3.5 py-3">
                                    <div className="min-w-0">
                                        <p className="text-[0.8125rem] font-semibold text-(--a-text)">
                                            Available for booking
                                        </p>
                                        <p className="mt-0.5 text-[0.6875rem] text-(--a-text-muted)">
                                            Disable to hide from booking flows.
                                        </p>
                                    </div>
                                    <StatusToggle
                                        checked={field.value}
                                        onChange={field.onChange}
                                        label="Room availability"
                                    />
                                </div>
                            )}
                        />

                        <FormStateSubscribe
                            control={form.control}
                            render={({ errors }) =>
                                errors.root?.message ? (
                                    <p className="rounded-md border border-[rgba(212,84,74,0.25)] bg-(--a-danger-subtle) px-3 py-2 text-[0.75rem] text-(--a-danger)">
                                        {errors.root.message}
                                    </p>
                                ) : (
                                    <></>
                                )
                            }
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-(--a-border) bg-(--a-surface-1) px-5 py-3">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className="rounded-lg bg-transparent px-3.5 py-1.5 text-xs font-medium text-(--a-text-secondary) transition-colors hover:bg-(--a-surface-2) hover:text-(--a-text) disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-accent) px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-(--a-accent-hover) disabled:opacity-60"
                        >
                            {isPending ? "Creating..." : "Create Room"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const Field = ({
    label,
    error,
    icon,
    inputId,
    children,
}: {
    label: string;
    error?: string;
    icon?: ReactNode;
    inputId: string;
    children: ReactNode;
}) => (
    <div>
        <label
            htmlFor={inputId}
            className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)"
        >
            {icon}
            {label}
        </label>
        {children}
        {error ? <p className="mt-1.5 text-[0.6875rem] text-(--a-danger)">{error}</p> : null}
    </div>
);
