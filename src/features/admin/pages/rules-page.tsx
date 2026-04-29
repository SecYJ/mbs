import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock, Info, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";
import { Controller } from "react-hook-form";

import { AdminHeader } from "@/features/admin/components/admin-header";
import { useUpdateBookingRules } from "@/features/admin/hooks/useUpdateBookingRules";
import { bookingRulesQueryOptions } from "@/features/admin/services/booking-rules/queries";

const DURATION_TICKS = [1, 6, 12, 18, 24];
const COMING_SOON_TAGS = ["Advance limits", "Recurring", "Working hours", "Quotas"];

const formatRelative = (input: string | Date | null | undefined) => {
    if (!input) return null;
    const date = typeof input === "string" ? new Date(input) : input;
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60_000) return "just now";
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
};

export const RulesPage = () => {
    const { data } = useSuspenseQuery(bookingRulesQueryOptions());
    const { form, onSubmit, isPending } = useUpdateBookingRules({
        maxBookingDurationHours: data.maxBookingDurationHours,
    });

    const watchedHours = form.watch("maxBookingDurationHours");
    const isDirty = form.formState.isDirty;
    const lastUpdatedLabel = formatRelative(data.updatedAt);

    return (
        <div>
            <AdminHeader title="Booking Rules" />

            <div className="p-6">
                <div className="mx-auto w-full max-w-2xl space-y-6">
                    <header className="space-y-1.5">
                        <h2 className="text-[1.0625rem] font-semibold tracking-tight text-(--a-text)">
                            Global booking policies
                        </h2>
                        <p className="text-[0.8125rem] leading-relaxed text-(--a-text-secondary)">
                            Configure rules that apply to every booking created across the platform. Changes take effect
                            immediately for new bookings.
                        </p>
                    </header>

                    <form onSubmit={onSubmit}>
                        <article
                            className="relative overflow-hidden rounded-2xl border border-(--a-border-hover) bg-(--a-surface-1)"
                            style={{
                                boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -12px rgba(0,0,0,0.4)",
                            }}
                        >
                            <div
                                aria-hidden
                                className="absolute inset-x-0 top-0 h-px"
                                style={{
                                    background:
                                        "linear-gradient(90deg, transparent 0%, var(--a-accent-border) 50%, transparent 100%)",
                                }}
                            />

                            <header className="flex items-start gap-4 border-b border-(--a-border) px-6 py-5">
                                <div
                                    className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                                    style={{
                                        background: "linear-gradient(135deg, var(--a-accent) 0%, #4f46e5 100%)",
                                        boxShadow: "0 8px 20px -6px rgba(99,102,241,0.55)",
                                    }}
                                >
                                    <Clock className="size-5 text-white" strokeWidth={2} />
                                </div>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3
                                            id="max-booking-duration-label"
                                            className="text-[0.9375rem] font-semibold text-(--a-text)"
                                        >
                                            Maximum booking duration
                                        </h3>
                                        <span
                                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-(--a-accent)"
                                            style={{
                                                background: "var(--a-accent-subtle)",
                                                border: "1px solid var(--a-accent-border)",
                                            }}
                                        >
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-[0.8125rem] leading-relaxed text-(--a-text-secondary)">
                                        How long a single booking can last. Users won&apos;t be able to create bookings
                                        longer than this limit.
                                    </p>
                                </div>
                            </header>

                            <Controller
                                name="maxBookingDurationHours"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <div className="space-y-6 px-6 py-6">
                                        <div
                                            className="flex items-baseline gap-2 rounded-xl border px-5 py-4"
                                            style={{
                                                background: "var(--a-accent-subtle)",
                                                borderColor: "var(--a-accent-border)",
                                            }}
                                        >
                                            <span className="text-4xl font-bold tabular-nums tracking-tight text-(--a-accent)">
                                                {watchedHours}
                                            </span>
                                            <span className="text-sm font-medium text-(--a-text-secondary)">
                                                {watchedHours === 1 ? "hour" : "hours"} max per booking
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-(--a-text-muted)">
                                                    Adjust
                                                </span>
                                                <Stepper
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    min={1}
                                                    max={24}
                                                    ariaLabel="Maximum booking duration in hours"
                                                />
                                                {fieldState.error && (
                                                    <span className="text-xs font-medium text-(--a-danger)">
                                                        {fieldState.error.message}
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                <input
                                                    type="range"
                                                    min={1}
                                                    max={24}
                                                    value={field.value}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                    aria-labelledby="max-booking-duration-label"
                                                    className="w-full accent-(--a-accent)"
                                                    style={{ height: 4 }}
                                                />
                                                <div className="mt-2 flex justify-between text-[0.625rem] tabular-nums text-(--a-text-muted)">
                                                    {DURATION_TICKS.map((tick) => (
                                                        <span key={tick}>{tick}h</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-(--a-border) pt-5">
                                            <span className="inline-flex items-center gap-1.5 text-xs text-(--a-text-muted)">
                                                <Info className="size-3" strokeWidth={2} />
                                                {lastUpdatedLabel
                                                    ? `Last updated ${lastUpdatedLabel}`
                                                    : "Applies to all new bookings"}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {isDirty && (
                                                    <button
                                                        type="button"
                                                        onClick={() => form.reset()}
                                                        disabled={isPending}
                                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-(--a-text-secondary) transition-colors hover:bg-(--a-surface-2) hover:text-(--a-text) disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <RotateCcw className="size-3" strokeWidth={2} />
                                                        Reset
                                                    </button>
                                                )}
                                                <button
                                                    type="submit"
                                                    disabled={!isDirty || isPending}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-accent) px-4 py-1.5 text-xs font-semibold text-white transition-[background-color,opacity,box-shadow] hover:bg-(--a-accent-hover) disabled:cursor-not-allowed disabled:opacity-40"
                                                    style={{
                                                        boxShadow:
                                                            !isDirty || isPending
                                                                ? "none"
                                                                : "0 6px 18px -4px rgba(99,102,241,0.5)",
                                                    }}
                                                >
                                                    {isPending ? "Saving…" : "Save changes"}
                                                </button>
                                            </div>
                                        </footer>
                                    </div>
                                )}
                            />
                        </article>
                    </form>

                    <article className="rounded-2xl border border-dashed border-(--a-border) bg-(--a-surface-0) px-6 py-5">
                        <div className="flex items-start gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--a-surface-2)">
                                <Sparkles className="size-5 text-(--a-text-muted)" strokeWidth={1.6} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-(--a-text-secondary)">
                                    More rules coming soon
                                </h3>
                                <p className="text-[0.8125rem] leading-relaxed text-(--a-text-muted)">
                                    Advance booking limits, recurring booking policies, working-hours windows, and
                                    per-user quotas are on the roadmap.
                                </p>
                                <ul className="flex flex-wrap gap-1.5 pt-1">
                                    {COMING_SOON_TAGS.map((tag) => (
                                        <li
                                            key={tag}
                                            className="rounded-full border border-(--a-border) bg-(--a-surface-1) px-2 py-0.5 text-[0.625rem] font-medium text-(--a-text-muted)"
                                        >
                                            {tag}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
};

interface StepperProps {
    value: number;
    onChange: (value: number) => void;
    onBlur: () => void;
    min: number;
    max: number;
    ariaLabel: string;
}

const Stepper = ({ value, onChange, onBlur, min, max, ariaLabel }: StepperProps) => {
    const clamp = (n: number) => Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));

    return (
        <div className="inline-flex items-center overflow-hidden rounded-lg border border-(--a-border-hover) bg-(--a-bg)">
            <button
                type="button"
                onClick={() => onChange(clamp(value - 1))}
                disabled={value <= min}
                className="flex size-8 items-center justify-center text-(--a-text-secondary) transition-colors hover:bg-(--a-surface-2) hover:text-(--a-text) disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={`Decrease ${ariaLabel}`}
            >
                <Minus className="size-3.5" strokeWidth={2.4} />
            </button>
            <input
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(clamp(Number(e.target.value)))}
                onBlur={onBlur}
                aria-label={ariaLabel}
                className="h-8 w-14 border-x border-(--a-border-hover) bg-transparent text-center text-sm font-semibold tabular-nums text-(--a-text) outline-none focus:bg-(--a-surface-1) [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
                type="button"
                onClick={() => onChange(clamp(value + 1))}
                disabled={value >= max}
                className="flex size-8 items-center justify-center text-(--a-text-secondary) transition-colors hover:bg-(--a-surface-2) hover:text-(--a-text) disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={`Increase ${ariaLabel}`}
            >
                <Plus className="size-3.5" strokeWidth={2.4} />
            </button>
        </div>
    );
};
