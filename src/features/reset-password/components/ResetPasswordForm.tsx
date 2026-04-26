"use client";

import { ArrowRight, KeyRound } from "lucide-react";
import { FormStateSubscribe } from "react-hook-form";

import { Link } from "@tanstack/react-router";

import { PasswordInput } from "@/components/password-input";
import { useResetPassword } from "@/features/reset-password/hooks/useResetPassword";

type Props = {
    token: string | undefined;
    error: string | undefined;
};

export const ResetPasswordForm = ({ token, error }: Props) => {
    if (!token || error) {
        return <InvalidLinkState reason={error} />;
    }

    return <ValidResetForm token={token} />;
};

const ValidResetForm = ({ token }: { token: string }) => {
    const { form, onSubmit, isPending, isSuccess } = useResetPassword({ token });

    return (
        <>
            <div
                className="mt-14 text-center"
                style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 320ms both" }}
            >
                <p className="eyebrow eyebrow-gold">Issue a new passphrase</p>
                <h1 className="mt-3 display-italic text-[2.6rem] leading-none tracking-[-0.02em] text-(--bone)">
                    Set the cipher.
                </h1>
                <p className="mx-auto mt-4 max-w-[38ch] text-[0.9rem] leading-relaxed text-(--bone-muted)">
                    Choose a passphrase you&rsquo;ll remember &mdash; we&rsquo;ll return you to the suite once
                    it&rsquo;s set.
                </p>
            </div>

            <form
                onSubmit={onSubmit}
                noValidate
                className="mt-12 space-y-7"
                style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 400ms both" }}
            >
                <PasswordInput
                    label="New Passphrase"
                    placeholder="Minimum eight characters"
                    name="newPassword"
                    control={form.control}
                    autoComplete="new-password"
                />

                <PasswordInput
                    label="Confirm Passphrase"
                    placeholder="Repeat to confirm"
                    name="confirmPassword"
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

                <div className="pt-4">
                    <FormStateSubscribe
                        control={form.control}
                        render={({ isSubmitting }) => (
                            <button
                                type="submit"
                                disabled={isPending || isSubmitting || isSuccess}
                                className="group relative flex h-12 w-full cursor-pointer items-center justify-center gap-3 border border-(--bone) bg-(--bone) text-[0.72rem] font-semibold tracking-[0.3em] uppercase text-black transition-all duration-300 hover:bg-white hover:border-white hover:tracking-[0.34em] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span>
                                    {isSuccess
                                        ? "Returning to sign-in"
                                        : isPending
                                          ? "Reissuing"
                                          : "Reissue passphrase"}
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
        </>
    );
};

const InvalidLinkState = ({ reason }: { reason: string | undefined }) => {
    const isExpired = reason === "INVALID_TOKEN" || reason === "TOKEN_EXPIRED";

    return (
        <section
            className="mt-14"
            aria-live="polite"
            style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 320ms both" }}
        >
            <div className="text-center">
                <p className="eyebrow eyebrow-gold">Recovery link</p>
                <h1 className="mt-3 display-italic text-[2.6rem] leading-none tracking-[-0.02em] text-(--bone)">
                    {isExpired ? "The link has lapsed." : "The link is missing."}
                </h1>
                <p className="mx-auto mt-4 max-w-[38ch] text-[0.9rem] leading-relaxed text-(--bone-muted)">
                    {isExpired
                        ? "Recovery links remain valid for 60 minutes. Request a fresh one and we'll dispatch it straight away."
                        : "We couldn't read a recovery token from this URL. Open the link from your inbox, or request a new one below."}
                </p>
            </div>

            <div className="mt-12 flex items-center gap-4 border-l border-(--gold) pl-5">
                <div className="inline-flex size-9 shrink-0 items-center justify-center border border-(--hairline-strong) text-(--gold)">
                    <KeyRound className="size-4" strokeWidth={1.4} />
                </div>
                <p className="text-[0.84rem] leading-relaxed text-(--bone-muted)">
                    No passphrase has been changed. Your current credentials still let you in.
                </p>
            </div>

            <div className="pt-10">
                <Link
                    to="/forgot-password"
                    className="group relative flex h-12 w-full cursor-pointer items-center justify-center gap-3 border border-(--bone) bg-(--bone) text-[0.72rem] font-semibold tracking-[0.3em] uppercase text-black no-underline transition-all duration-300 hover:bg-white hover:border-white hover:tracking-[0.34em]"
                >
                    <span>Dispatch a new link</span>
                    <ArrowRight
                        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                        strokeWidth={1.6}
                    />
                </Link>
            </div>
        </section>
    );
};
