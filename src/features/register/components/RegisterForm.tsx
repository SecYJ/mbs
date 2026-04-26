"use client";

import { Link } from "@tanstack/react-router";
import { Controller } from "react-hook-form";

import { PasswordInput } from "@/components/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterSubmitAction } from "@/features/register/components/RegisterSubmitAction";
import { useRegister } from "@/features/register/hooks/useRegister";

export const RegisterForm = () => {
    const { form, onSubmit } = useRegister();

    return (
        <form
            onSubmit={onSubmit}
            noValidate
            className="mt-10 space-y-7"
            style={{ animation: "fade-up 800ms cubic-bezier(0.16,1,0.3,1) 400ms both" }}
        >
            <div className="space-y-3">
                <Label htmlFor="name" className="eyebrow block">
                    Full Name
                </Label>
                <Controller
                    control={form.control}
                    name="name"
                    render={({ field, fieldState: { error } }) => (
                        <>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Jane Doe"
                                autoComplete="name"
                                aria-invalid={error ? true : undefined}
                                className="login-input-underline h-11 rounded-none bg-transparent text-[0.95rem] text-(--bone) shadow-none placeholder:text-(--bone-faint) focus-visible:ring-0"
                                {...field}
                            />
                            {error ? <p className="text-[0.72rem] text-red-400/80">{error.message}</p> : null}
                        </>
                    )}
                />
            </div>

            <div className="space-y-3">
                <Label htmlFor="email-register" className="eyebrow block">
                    Email Address
                </Label>
                <Controller
                    control={form.control}
                    name="email"
                    render={({ field, fieldState: { error } }) => (
                        <>
                            <Input
                                id="email-register"
                                type="email"
                                placeholder="you@company.com"
                                autoComplete="email"
                                aria-invalid={error ? true : undefined}
                                className="login-input-underline h-11 rounded-none bg-transparent text-[0.95rem] text-(--bone) shadow-none placeholder:text-(--bone-faint) focus-visible:ring-0"
                                {...field}
                            />
                            {error ? <p className="text-[0.72rem] text-red-400/80">{error.message}</p> : null}
                        </>
                    )}
                />
            </div>

            <PasswordInput
                label="Passphrase"
                placeholder="Minimum eight characters"
                name="password"
                control={form.control}
            />

            <PasswordInput
                label="Confirm Passphrase"
                placeholder="Repeat to confirm"
                name="confirmPassword"
                control={form.control}
            />

            <p className="text-[0.72rem] leading-relaxed text-(--bone-dim)">
                By requesting a suite, you accept the{" "}
                <Link
                    to="/"
                    className="text-(--bone-muted) no-underline transition-colors hover:text-(--gold)"
                    style={{
                        textUnderlineOffset: "3px",
                        textDecoration: "underline",
                        textDecorationColor: "rgba(255,255,255,0.12)",
                    }}
                >
                    house rules
                </Link>{" "}
                and our{" "}
                <Link
                    to="/"
                    className="text-(--bone-muted) no-underline transition-colors hover:text-(--gold)"
                    style={{
                        textUnderlineOffset: "3px",
                        textDecoration: "underline",
                        textDecorationColor: "rgba(255,255,255,0.12)",
                    }}
                >
                    discretion clause
                </Link>
                .
            </p>

            <RegisterSubmitAction control={form.control} label="Open Ledger" />
        </form>
    );
};
