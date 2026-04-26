import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { loginUserFn } from "@/features/login/functions/login";
import { loginSchema } from "@/features/login/schema/login.schema";

export const useLogin = () => {
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const navigate = useNavigate({ from: "/login" });
    const loginFn = useServerFn(loginUserFn);

    const { mutate: submitLogin, isPending } = useMutation({
        mutationFn: loginFn,
        onSuccess: () => {
            navigate({ to: "/bookings" });
        },
        onError: (error) => {
            form.setError("root", {
                message: error instanceof Error ? error.message : "Unable to sign in. Please try again.",
            });
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        form.clearErrors("root");
        submitLogin({ data: values });
    });

    return { form, onSubmit, isPending };
};
