import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { requestPasswordResetFn } from "@/features/forgot-password/functions/forgot-password";
import { forgotPasswordSchema } from "@/features/forgot-password/schema/forgot-password.schema";
import { clearCooldownTimestamp, readCooldownTimestamp, writeCooldownTimestamp } from "@/lib/cooldown";
import { RESET_PASSWORD_COOLDOWN_MS } from "@/constants/password-reset";

const STORAGE_KEY = "forgot-password:cooldown-until";

export const useForgotPassword = () => {
    const form = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        setCooldownUntil(readCooldownTimestamp(STORAGE_KEY));
    }, []);

    useEffect(() => {
        if (!cooldownUntil) return;
        const id = setInterval(() => setNow(Date.now()), 1000);

        return () => clearInterval(id);
    }, [cooldownUntil]);

    useEffect(() => {
        if (cooldownUntil && now >= cooldownUntil) {
            clearCooldownTimestamp(STORAGE_KEY);
            setCooldownUntil(null);
        }
    }, [cooldownUntil, now]);

    const secondsLeft = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;

    const requestReset = useServerFn(requestPasswordResetFn);

    const {
        mutate: submitForgotPassword,
        isPending,
        isSuccess,
        data,
        reset,
    } = useMutation({
        mutationFn: requestReset,
        onSuccess: () => {
            const until = Date.now() + RESET_PASSWORD_COOLDOWN_MS;
            writeCooldownTimestamp(STORAGE_KEY, until);
            setCooldownUntil(until);
            setNow(Date.now());
        },
        onError: (error) => {
            form.setError("root", {
                message:
                    error instanceof Error ? error.message : "Unable to dispatch the recovery link. Please try again.",
            });
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        if (secondsLeft > 0) return;
        form.clearErrors("root");
        submitForgotPassword({ data: values });
    });

    const sentToEmail = isSuccess && data ? form.getValues("email") : null;

    const reopen = () => {
        if (secondsLeft > 0) return;
        reset();
        form.reset({ email: "" });
    };

    return { form, onSubmit, isPending, isSuccess, sentToEmail, reopen, secondsLeft };
};
