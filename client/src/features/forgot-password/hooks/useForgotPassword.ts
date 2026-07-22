import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { requestPasswordResetFn } from "@/features/forgot-password/functions/forgot-password";
import { forgotPasswordSchema } from "@/features/forgot-password/schema/forgot-password.schema";

export const useForgotPassword = () => {
    const form = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const requestReset = useServerFn(requestPasswordResetFn);

    const {
        mutate: submitForgotPassword,
        isPending,
        isSuccess,
        data,
        reset,
    } = useMutation({
        mutationFn: requestReset,
        onError: (error) => {
            form.setError("root", {
                message:
                    error instanceof Error ? error.message : "Unable to dispatch the recovery link. Please try again.",
            });
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        form.clearErrors("root");
        submitForgotPassword({ data: values });
    });

    const sentToEmail = isSuccess && data ? form.getValues("email") : null;

    const reopen = () => {
        reset();
        form.reset({ email: "" });
    };

    return { form, onSubmit, isPending, isSuccess, sentToEmail, reopen };
};
