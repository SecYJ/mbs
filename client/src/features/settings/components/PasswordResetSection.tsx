import { KeyRound } from "lucide-react";
import { FormStateSubscribe } from "react-hook-form";

import { PasswordInput } from "@/components/PasswordInput";
import { useChangePassword } from "@/features/settings/hooks/useChangePassword";

export const PasswordResetSection = () => {
    const { form, onSubmit, isPending } = useChangePassword();

    return (
        <section className="border-y border-(--hairline)">
            <div className="grid gap-8 py-7 lg:grid-cols-[minmax(0,0.82fr)_minmax(19rem,0.68fr)] lg:items-start">
                <div className="flex gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center border border-(--hairline) text-(--gold)">
                        <KeyRound className="size-4" strokeWidth={1.4} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-(--bone)">Reset passphrase</h2>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-(--bone-muted)">
                            Update the passphrase tied to this account. You will need your current passphrase to make
                            the change. Changing your passphrase signs you out of other sessions and redirects you to
                            login.
                        </p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                    <PasswordInput
                        label="Current Passphrase"
                        placeholder="Enter current passphrase"
                        name="currentPassword"
                        control={form.control}
                        autoComplete="current-password"
                    />

                    <PasswordInput
                        label="New Passphrase"
                        placeholder="Minimum eight characters"
                        name="newPassword"
                        control={form.control}
                        autoComplete="new-password"
                    />

                    <PasswordInput
                        label="Confirm New Passphrase"
                        placeholder="Repeat new passphrase"
                        name="confirmNewPassword"
                        control={form.control}
                        autoComplete="new-password"
                    />

                    <FormStateSubscribe
                        control={form.control}
                        render={({ errors }) =>
                            errors.root ? (
                                <p role="alert" className="text-[0.72rem] text-red-400/80">
                                    {errors.root.message}
                                </p>
                            ) : null
                        }
                    />

                    <FormStateSubscribe
                        control={form.control}
                        render={({ isSubmitting }) => (
                            <button
                                type="submit"
                                disabled={isPending || isSubmitting}
                                className="group flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 border border-(--bone) bg-(--bone) px-4 text-[0.68rem] font-semibold tracking-[0.26em] text-black uppercase transition-all duration-300 hover:border-white hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span>{isPending ? "Updating" : "Update passphrase"}</span>
                                <KeyRound className="size-4" strokeWidth={1.6} />
                            </button>
                        )}
                    />
                </form>
            </div>
        </section>
    );
};
