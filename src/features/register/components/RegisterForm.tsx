import { Link } from "@tanstack/react-router";
import { Controller, FormStateSubscribe } from "react-hook-form";

import { PasswordInput } from "@/components/PasswordInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterSubmitAction } from "@/features/register/components/RegisterSubmitAction";
import { useRegister } from "@/features/register/hooks/useRegister";

export const RegisterForm = () => {
    const { form, onSubmit, isPending } = useRegister();

    return (
        <form
            onSubmit={onSubmit}
            className="mt-10 space-y-7 animate-fade-up animation-duration-800 [animation-delay:400ms]"
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
                    className="text-(--bone-muted) underline decoration-white/12 underline-offset-3 transition-colors hover:text-(--gold)"
                >
                    house rules
                </Link>{" "}
                and our{" "}
                <Link
                    to="/"
                    className="text-(--bone-muted) underline decoration-white/12 underline-offset-3 transition-colors hover:text-(--gold)"
                >
                    discretion clause
                </Link>
                .
            </p>

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

            <RegisterSubmitAction control={form.control} isPending={isPending} label="Open Ledger" />
        </form>
    );
};
