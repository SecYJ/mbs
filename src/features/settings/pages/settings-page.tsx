import { Bell, SlidersHorizontal, Volume2, VolumeX } from "lucide-react";

import { PasswordResetSection } from "@/features/settings/components/password-reset-section";
import { playNotificationSound } from "@/features/settings/notification-sound";
import { cn } from "@/lib/utils";
import { usePersistentClientStore } from "@/stores/persistent-client-store";

export const SettingsPage = () => {
    const soundEnabled = usePersistentClientStore((state) => state.userPreferences.soundEnabled);
    const updateUserPreferences = usePersistentClientStore((state) => state.actions.updateUserPreferences);

    const handleSoundToggle = () => {
        updateUserPreferences((current) => ({
            ...current,
            soundEnabled: !current.soundEnabled,
        }));
    };

    const handleTestSound = () => {
        if (!soundEnabled) return;

        void playNotificationSound();
    };

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            <header className="flex flex-col gap-5 border-b border-(--hairline) pb-7 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="eyebrow text-(--gold)">PREFERENCES</p>
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
                            className={cn(
                                "relative h-7 w-12 cursor-pointer border transition-colors",
                                soundEnabled
                                    ? "border-(--signal)/60 bg-(--signal)/20"
                                    : "border-(--hairline) bg-(--surface-02)",
                            )}
                            aria-label="Toggle notification sound"
                        >
                            <span
                                className={cn(
                                    "absolute top-1 size-5 transition-all",
                                    soundEnabled ? "right-1 bg-(--signal)" : "left-1 bg-(--bone-dim)",
                                )}
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
