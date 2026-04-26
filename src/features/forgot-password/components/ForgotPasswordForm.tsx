"use client";

import { ArrowRight, Mail } from "lucide-react";
import { Controller, FormStateSubscribe } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/features/forgot-password/hooks/useForgotPassword";
import { formatCountdown } from "@/lib/format";
import { RESET_PASSWORD_TOKEN_EXPIRES_IN_MINUTES } from "@/constants/password-reset";

export const ForgotPasswordForm = () => {
    const { form, onSubmit, isPending, isSuccess, sentToEmail, reopen, secondsLeft } = useForgotPassword();
    const isCoolingDown = secondsLeft > 0;

    if (isSuccess && sentToEmail) {
        return (
            <section
                aria-live="polite"
                className="mt-12 space-y-8"
                style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 0ms both" }}
            >
                <div className="flex items-start gap-4 border-l border-(--gold) pl-5">
                    <div className="inline-flex size-9 shrink-0 items-center justify-center border border-(--hairline-strong) text-(--gold)">
                        <Mail className="size-4" strokeWidth={1.4} />
                    </div>
                    <div className="space-y-2">
                        <p className="eyebrow eyebrow-gold">Dispatched</p>
                        <p className="display-italic text-[1.6rem] leading-tight tracking-[-0.01em] text-(--bone)">
                            Check your inbox.
                        </p>
                        <p className="text-[0.86rem] leading-relaxed text-(--bone-muted)">
                            If an account exists for <span className="tabular-num text-(--bone)">{sentToEmail}</span>, a
                            recovery link is on its way. The link expires in{" "}
                            <span className="tabular-num text-(--bone)">{RESET_PASSWORD_TOKEN_EXPIRES_IN_MINUTES}</span>{" "}
                            minutes.
                        </p>
                    </div>
                </div>

                <div aria-hidden className="h-px w-full bg-(--hairline)" />

                <div className="flex items-center justify-between gap-4">
                    <p className="text-[0.78rem] leading-relaxed text-(--bone-dim)">
                        Nothing arrived? Glance at the spam folio, or dispatch again with a different address.
                    </p>
                    <button
                        type="button"
                        onClick={reopen}
                        disabled={isCoolingDown}
                        aria-live="polite"
                        className="shrink-0 cursor-pointer text-[0.7rem] font-semibold tracking-[0.24em] uppercase text-(--bone-muted) transition-colors hover:text-(--gold) disabled:cursor-not-allowed disabled:text-(--bone-faint) disabled:hover:text-(--bone-faint)"
                    >
                        {isCoolingDown ? `Send again in ${formatCountdown(secondsLeft)}` : "Send another"}
                    </button>
                </div>
            </section>
        );
    }

    return (
        <form
            onSubmit={onSubmit}
            noValidate
            className="mt-12 space-y-8"
            style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 400ms both" }}
        >
            <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState: { error } }) => (
                    <div className="space-y-3">
                        <Label htmlFor="forgot-email" className="eyebrow block">
                            Email Address
                        </Label>
                        <Input
                            id="forgot-email"
                            type="email"
                            placeholder="you@company.com"
                            autoComplete="email"
                            aria-invalid={error ? true : undefined}
                            className="login-input-underline h-11 rounded-none bg-transparent text-[0.95rem] text-(--bone) shadow-none placeholder:text-(--bone-faint) focus-visible:ring-0"
                            {...field}
                        />
                        {error ? <p className="text-[0.72rem] text-red-400/80">{error.message}</p> : null}
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

            <div className="pt-4">
                <FormStateSubscribe
                    control={form.control}
                    render={({ isSubmitting }) => (
                        <button
                            type="submit"
                            disabled={isPending || isSubmitting || isCoolingDown}
                            className="group relative flex h-12 w-full cursor-pointer items-center justify-center gap-3 border border-(--bone) bg-(--bone) text-[0.72rem] font-semibold tracking-[0.3em] uppercase text-black transition-all duration-300 hover:bg-white hover:border-white hover:tracking-[0.34em] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span>
                                {isCoolingDown
                                    ? `Send again in ${formatCountdown(secondsLeft)}`
                                    : isPending
                                      ? "Dispatching"
                                      : "Dispatch link"}
                            </span>
                            <ArrowRight
                                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                strokeWidth={1.6}
                            />
                        </button>
                    )}
                />
            </div>
        </form>
    );
};
