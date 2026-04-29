"use client";

import { Controller, FormStateSubscribe } from "react-hook-form";
import { Building2, CalendarDays, DollarSign, Hash, ShieldCheck, Tag, Wrench } from "lucide-react";
import type { ReactNode } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { adminInputClasses } from "@/features/admin/admin-classes";
import { useAdminToast } from "@/features/admin/components/admin-layout";
import { useEquipmentCreateStore } from "@/features/admin/stores/equipment-create-store";
import { useCreateEquipment } from "@/features/admin/hooks/useCreateEquipment";

export const CreateEquipmentDialog = () => {
    const { toast } = useAdminToast();
    const open = useEquipmentCreateStore((s) => s.open);
    const { setOpen } = useEquipmentCreateStore((s) => s.actions);

    const { form, onSubmit, isPending } = useCreateEquipment({
        onSuccess: () => {
            toast("Equipment created", "success");
            setOpen(false);
        },
    });

    const handleOpenChange = (nextOpen: boolean) => {
        if (isPending && !nextOpen) return;
        setOpen(nextOpen);
        if (!nextOpen) form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
                            <Wrench className="size-4 text-white" strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-[0.9375rem] font-bold tracking-tight text-(--a-text)">
                                New Equipment
                            </DialogTitle>
                            <p className="mt-0.5 text-[0.6875rem] text-(--a-text-muted)">
                                Add a piece of equipment to the catalog.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5 px-5 py-5">
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field, fieldState: { error } }) => (
                                <Field label="Name" error={error?.message} inputId="create-equipment-name">
                                    <input
                                        {...field}
                                        id="create-equipment-name"
                                        className={`${adminInputClasses} w-full`}
                                        placeholder="Conference Speaker"
                                    />
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="brand"
                                render={({ field, fieldState: { error } }) => (
                                    <Field
                                        label="Brand"
                                        error={error?.message}
                                        inputId="create-equipment-brand"
                                        icon={<Building2 className="size-3" strokeWidth={1.6} />}
                                    >
                                        <input
                                            {...field}
                                            id="create-equipment-brand"
                                            className={`${adminInputClasses} w-full`}
                                            placeholder="Logitech"
                                        />
                                    </Field>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="model"
                                render={({ field, fieldState: { error } }) => (
                                    <Field
                                        label="Model"
                                        error={error?.message}
                                        inputId="create-equipment-model"
                                        icon={<Tag className="size-3" strokeWidth={1.6} />}
                                    >
                                        <input
                                            {...field}
                                            id="create-equipment-model"
                                            className={`${adminInputClasses} w-full`}
                                            placeholder="MX-200"
                                        />
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="price"
                                render={({ field, fieldState: { error } }) => (
                                    <Field
                                        label="Price"
                                        error={error?.message}
                                        inputId="create-equipment-price"
                                        icon={<DollarSign className="size-3" strokeWidth={1.6} />}
                                    >
                                        <input
                                            {...field}
                                            id="create-equipment-price"
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            value={Number.isFinite(field.value) ? field.value : ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? undefined : e.target.valueAsNumber,
                                                )
                                            }
                                            className={`${adminInputClasses} w-full tabular-nums`}
                                        />
                                    </Field>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="quantity"
                                render={({ field, fieldState: { error } }) => (
                                    <Field
                                        label="Quantity"
                                        error={error?.message}
                                        inputId="create-equipment-quantity"
                                        icon={<Hash className="size-3" strokeWidth={1.6} />}
                                    >
                                        <input
                                            {...field}
                                            id="create-equipment-quantity"
                                            type="number"
                                            step="1"
                                            min={1}
                                            value={Number.isFinite(field.value) ? field.value : ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? undefined : e.target.valueAsNumber,
                                                )
                                            }
                                            className={`${adminInputClasses} w-full tabular-nums`}
                                        />
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="purchaseDate"
                                render={({ field, fieldState: { error } }) => (
                                    <Field
                                        label="Purchase Date"
                                        error={error?.message}
                                        inputId="create-equipment-purchase"
                                        icon={<CalendarDays className="size-3" strokeWidth={1.6} />}
                                    >
                                        <input
                                            {...field}
                                            id="create-equipment-purchase"
                                            type="date"
                                            className={`${adminInputClasses} w-full tabular-nums`}
                                        />
                                    </Field>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="warrantyExpiry"
                                render={({ field, fieldState: { error } }) => (
                                    <Field
                                        label="Warranty Expiry"
                                        optional
                                        error={error?.message}
                                        inputId="create-equipment-warranty"
                                        icon={<ShieldCheck className="size-3" strokeWidth={1.6} />}
                                    >
                                        <input
                                            {...field}
                                            id="create-equipment-warranty"
                                            value={field.value ?? ""}
                                            type="date"
                                            className={`${adminInputClasses} w-full tabular-nums`}
                                        />
                                    </Field>
                                )}
                            />
                        </div>

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
                            onClick={() => handleOpenChange(false)}
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
                            {isPending ? "Creating..." : "Create Equipment"}
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
    optional,
    inputId,
    children,
}: {
    label: string;
    error?: string;
    icon?: ReactNode;
    optional?: boolean;
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
            {optional ? (
                <span className="ml-1 text-[0.625rem] font-medium normal-case tracking-normal text-(--a-text-muted)">
                    (optional)
                </span>
            ) : null}
        </label>
        {children}
        {error ? <p className="mt-1.5 text-[0.6875rem] text-(--a-danger)">{error}</p> : null}
    </div>
);
