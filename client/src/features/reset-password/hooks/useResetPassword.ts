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

// better-auth rejects a bad or expired token with "Invalid token"; show a clearer message for it.
const getResetErrorMessage = (error: unknown) => {
    if (!(error instanceof Error)) return "Unable to reissue your passphrase. Please try again.";

    if (/token/i.test(error.message)) return "This reset link is invalid or has expired.";

    return error.message;
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
        // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- Password reset completion has no cached query data to invalidate.
    } = useMutation({
        mutationFn: reset,
        onSuccess: () => {
            navigate({ to: "/login" });
        },
        onError: (error) => {
            form.setError("root", { message: getResetErrorMessage(error) });
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
