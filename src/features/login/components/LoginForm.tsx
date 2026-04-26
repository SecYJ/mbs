"use client";

import { ArrowRight } from "lucide-react";
import { Controller, FormStateSubscribe } from "react-hook-form";

import { Link } from "@tanstack/react-router";

import { PasswordInput } from "@/components/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/features/login/hooks/useLogin";

export const LoginForm = () => {
    const { form, onSubmit, isPending } = useLogin();

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
                        <Label htmlFor="email" className="eyebrow block">
                            Email Address
                        </Label>
                        <Input
                            id="email"
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

            <PasswordInput
                label="Passphrase"
                placeholder="&bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull;"
                name="password"
                control={form.control}
                autoComplete="current-password"
                labelAccessory={
                    <Link
                        to="/forgot-password"
                        className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-(--bone-dim) no-underline transition-colors hover:text-(--gold)"
                    >
                        Forgot?
                    </Link>
                }
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
                            disabled={isPending || isSubmitting}
                            className="group relative flex h-12 w-full cursor-pointer items-center justify-center gap-3 border border-(--bone) bg-(--bone) text-[0.72rem] font-semibold tracking-[0.3em] uppercase text-black transition-all duration-300 hover:bg-white hover:border-white hover:tracking-[0.34em] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span>Continue</span>
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
