import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { changePasswordFn } from "@/features/auth/services/change-password";
import { signOutFn } from "@/features/auth/services/sign-out";
import { changePasswordSchema } from "@/features/settings/schema/change-password.schema";
import { broadcastSessionSignOut } from "@/lib/session-broadcast";

export function useChangePassword() {
    const navigate = useNavigate({ from: "/settings" });
    const changePassword = useServerFn(changePasswordFn);

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
        mutationFn: changePassword,
        onSuccess: async (_data, _values, _onMutateResult, context) => {
            form.reset();

            broadcastSessionSignOut();
            context.client.clear();

            try {
                await signOutFn();
            } finally {
                navigate({ to: "/login", replace: true });
            }
        },
        onError: (error) => {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to update your passphrase. Please check your current passphrase and try again.";

            form.setError("root", { message });
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        reset();
        form.clearErrors("root");
        submitChangePassword({ data: values });
    });

    return { form, onSubmit, isPending };
}
