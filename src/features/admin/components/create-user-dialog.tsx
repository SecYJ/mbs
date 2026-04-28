"use client";

import { Controller, FormStateSubscribe } from "react-hook-form";
import { KeyRound, Mail, UserPlus } from "lucide-react";
import type { ReactNode } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { adminInputClasses } from "@/features/admin/admin-classes";
import { useAdminToast } from "@/features/admin/components/admin-layout";
import { useCreateUser } from "@/features/admin/hooks/useCreateUser";

type CreateUserDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const CreateUserDialog = ({ open, onOpenChange }: CreateUserDialogProps) => {
    const { toast } = useAdminToast();

    const { form, onSubmit, isPending } = useCreateUser({
        onSuccess: () => {
            toast("User created", "success");
            onOpenChange(false);
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="admin-shell border-0 bg-transparent p-0 shadow-none sm:max-w-[440px]"
            >
                <form
                    onSubmit={onSubmit}
                    noValidate
                    autoComplete="off"
                    className="overflow-hidden rounded-xl border border-(--a-border-hover) bg-(--a-surface-0) text-(--a-text) shadow-2xl"
                >
                    <div className="flex items-center gap-3 border-b border-(--a-border) px-5 py-4">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--a-accent)">
                            <UserPlus className="size-4 text-white" strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-[0.9375rem] font-bold tracking-tight text-(--a-text)">
                                New User
                            </DialogTitle>
                            <p className="mt-0.5 text-[0.6875rem] text-(--a-text-muted)">
                                Create a login for the booking system.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5 px-5 py-5">
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field, fieldState: { error } }) => (
                                <Field label="Full Name" error={error?.message} inputId="create-user-name">
                                    <input
                                        {...field}
                                        id="create-user-name"
                                        autoComplete="off"
                                        className={`${adminInputClasses} w-full`}
                                        placeholder="Jane Doe"
                                    />
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="email"
                            render={({ field, fieldState: { error } }) => (
                                <Field
                                    label="Email"
                                    error={error?.message}
                                    inputId="create-user-email"
                                    icon={<Mail className="size-3" strokeWidth={1.6} />}
                                >
                                    <input
                                        {...field}
                                        id="create-user-email"
                                        type="email"
                                        autoComplete="off"
                                        className={`${adminInputClasses} w-full`}
                                        placeholder="jane@company.com"
                                    />
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="password"
                                render={({ field, fieldState: { error } }) => (
                                    <Field
                                        label="Password"
                                        error={error?.message}
                                        inputId="create-user-password"
                                        icon={<KeyRound className="size-3" strokeWidth={1.6} />}
                                    >
                                        <input
                                            {...field}
                                            id="create-user-password"
                                            type="password"
                                            className={`${adminInputClasses} w-full`}
                                            autoComplete="new-password"
                                        />
                                    </Field>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="confirmPassword"
                                render={({ field, fieldState: { error } }) => (
                                    <Field label="Confirm" error={error?.message} inputId="create-user-confirm">
                                        <input
                                            {...field}
                                            id="create-user-confirm"
                                            type="password"
                                            className={`${adminInputClasses} w-full`}
                                            autoComplete="new-password"
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
                            onClick={() => onOpenChange(false)}
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
                            {isPending ? "Creating..." : "Create User"}
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
