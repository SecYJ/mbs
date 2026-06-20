import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { changePasswordSchema, type ChangePasswordValues } from "@/features/settings/schema/change-password.schema";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";

export const useChangePassword = () => {
    const form = useForm({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
            revokeOtherSessions: true,
        },
    });

    const {
        mutate: submitChangePassword,
        isPending,
        isSuccess,
        reset,
    } = useMutation({
        mutationFn: async (values: ChangePasswordValues) => {
            const { error } = await authClient.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                revokeOtherSessions: values.revokeOtherSessions,
            });

            if (error) {
                throw new Error(error.message ?? "Unable to update your passphrase.");
            }
        },
        onSuccess: () => form.reset(),
        onError: (error) => {
            const message = z
                .instanceof(Error)
                .transform((v) => v.message)
                .catch("Unable to update your passphrase. Please check your current passphrase and try again.")
                .parse(error);

            form.setError("root", { message });
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        reset();
        form.clearErrors("root");
        submitChangePassword(values);
    });

    return { form, onSubmit, isPending, isSuccess };
};
