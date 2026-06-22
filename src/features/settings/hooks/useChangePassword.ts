import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { changePasswordSchema, type ChangePasswordValues } from "@/features/settings/schema/change-password.schema";
import { authClient } from "@/lib/auth-client";
import { broadcastSessionSignOut } from "@/lib/session-broadcast";

export const useChangePassword = () => {
    const navigate = useNavigate({ from: "/settings" });

    const form = useForm({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    });

    const {
        mutate: submitChangePassword,
        isPending,
        reset,
    } = useMutation({
        mutationFn: async (values: ChangePasswordValues) => {
            const { error } = await authClient.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                revokeOtherSessions: true,
            });

            if (error) {
                throw new Error(error.message ?? "Unable to update your passphrase.");
            }
        },
        onSuccess: async (_data, _values, _onMutateResult, context) => {
            form.reset();

            broadcastSessionSignOut();
            context.client.clear();

            try {
                await authClient.signOut();
            } finally {
                navigate({ to: "/login", replace: true });
            }
        },
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

    return { form, onSubmit, isPending };
};
