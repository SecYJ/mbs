import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { resetPasswordFn } from "@/features/reset-password/functions/reset-password";
import { resetPasswordSchema } from "@/features/reset-password/schema/reset-password.schema";

type Args = {
    token: string;
};

export const useResetPassword = ({ token }: Args) => {
    const form = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
            token,
        },
    });

    const navigate = useNavigate();
    const reset = useServerFn(resetPasswordFn);

    const {
        mutate: submitReset,
        isPending,
        isSuccess,
    } = useMutation({
        mutationFn: reset,
        onSuccess: () => {
            navigate({ to: "/login" });
        },
        onError: (error) => {
            form.setError("root", {
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to reissue your passphrase. The link may have expired.",
            });
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        form.clearErrors("root");
        submitReset({
            data: {
                newPassword: values.newPassword,
                token: values.token,
            },
        });
    });

    return { form, onSubmit, isPending, isSuccess };
};
