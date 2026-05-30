"use client";

import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, KeyRound, ShieldCheck, SlidersHorizontal, Volume2, VolumeX } from "lucide-react";
import { useId } from "react";
import { Controller, FormStateSubscribe } from "react-hook-form";

import { PasswordInput } from "@/components/password-input";
import { useChangePassword } from "@/features/settings/hooks/useChangePassword";
import { playNotificationSound } from "@/features/settings/notification-sound";
import { useUserPreferences } from "@/features/settings/user-preferences";

export const SettingsPage = () => {
    const { preferences, updatePreferences } = useUserPreferences();
    const soundEnabled = preferences.notifications.soundEnabled;

    const handleSoundToggle = () => {
        updatePreferences((current) => ({
            ...current,
            notifications: {
                ...current.notifications,
                soundEnabled: !current.notifications.soundEnabled,
            },
        }));
    };

    const handleTestSound = () => {
        void playNotificationSound();
    };

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            <header className="flex flex-col gap-5 border-b border-(--hairline) pb-7 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="eyebrow eyebrow-gold">PREFERENCES</p>
                    <h1 className="display-serif mt-3 text-4xl leading-none text-(--bone) md:text-5xl">Settings</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-(--bone-muted)">
                        Notification and account preferences.
                    </p>
                </div>
                <div className="flex size-14 items-center justify-center border border-(--hairline) text-(--gold)">
                    <SlidersHorizontal className="size-5" strokeWidth={1.4} />
                </div>
            </header>

            <section className="border-y border-(--hairline)">
                <div className="grid gap-5 py-6 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="flex gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center border border-(--hairline) text-(--gold)">
                            {soundEnabled ? (
                                <Volume2 className="size-4" strokeWidth={1.4} />
                            ) : (
                                <VolumeX className="size-4" strokeWidth={1.4} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-(--bone)">Notification sound</h2>
                            <p className="mt-1 text-sm text-(--bone-muted)">
                                {soundEnabled ? "Sound alerts are on." : "Sound alerts are off."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pl-14 md:pl-0">
                        <button
                            type="button"
                            onClick={handleTestSound}
                            disabled={!soundEnabled}
                            className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-(--hairline) px-3 text-[0.62rem] font-semibold tracking-[0.2em] text-(--bone-dim) uppercase transition-colors hover:border-(--hairline-strong) hover:text-(--bone) disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Volume2 className="size-3.5" strokeWidth={1.4} />
                            <span>Test</span>
                        </button>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={soundEnabled}
                            onClick={handleSoundToggle}
                            className={
                                soundEnabled
                                    ? "relative h-7 w-12 cursor-pointer border border-(--signal)/60 bg-(--signal)/20 transition-colors"
                                    : "relative h-7 w-12 cursor-pointer border border-(--hairline) bg-(--surface-02) transition-colors"
                            }
                            aria-label="Toggle notification sound"
                        >
                            <span
                                className={
                                    soundEnabled
                                        ? "absolute top-1 right-1 size-5 bg-(--signal) transition-all"
                                        : "absolute top-1 left-1 size-5 bg-(--bone-dim) transition-all"
                                }
                            />
                        </button>
                    </div>
                </div>
            </section>

            <PasswordResetSection />

            <section className="grid gap-3 md:grid-cols-3">
                {["Delivery", "Quiet hours", "Digest"].map((setting) => (
                    <div key={setting} className="border border-(--hairline) p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Bell className="size-4 text-(--bone-dim)" strokeWidth={1.4} />
                                <h2 className="text-sm font-semibold text-(--bone)">{setting}</h2>
                            </div>
                            <span className="border border-(--hairline) px-2 py-1 text-[0.56rem] font-semibold tracking-[0.2em] text-(--bone-dim) uppercase">
                                Soon
                            </span>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};

export const PasswordResetSection = () => {
    const { form, onSubmit, isPending, isSuccess } = useChangePassword();
    const revokeOtherSessionsId = useId();

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
                            the change.
                        </p>
                        {isSuccess ? (
                            <p
                                role="status"
                                className="mt-4 inline-flex items-center gap-2 border border-(--success)/30 bg-(--success-subtle) px-3 py-2 text-xs font-semibold text-(--success)"
                            >
                                <Check className="size-3.5" strokeWidth={1.6} />
                                Passphrase updated.
                            </p>
                        ) : null}
                    </div>
                </div>

                <form onSubmit={onSubmit} noValidate className="space-y-5">
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

                    <Controller
                        control={form.control}
                        name="revokeOtherSessions"
                        render={({ field }) => (
                            <div className="flex items-start gap-3 border border-(--hairline) p-3 transition-colors hover:border-(--hairline-strong)">
                                <input
                                    id={revokeOtherSessionsId}
                                    type="checkbox"
                                    aria-label="End other sessions"
                                    checked={field.value}
                                    onChange={(event) => field.onChange(event.target.checked)}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                    className="mt-1 size-4 accent-(--gold)"
                                />
                                <label htmlFor={revokeOtherSessionsId} className="cursor-pointer">
                                    <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-(--bone) uppercase">
                                        <ShieldCheck className="size-3.5 text-(--gold)" strokeWidth={1.4} />
                                        End other sessions
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-(--bone-muted)">
                                        Keep this browser signed in and require fresh sign-in everywhere else.
                                    </span>
                                </label>
                            </div>
                        )}
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

// react-doctor-disable-next-line react-doctor/only-export-components -- TanStack file routes must export Route.
export const Route = createFileRoute("/_bookings/settings")({
    component: SettingsPage,
});
