"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { loginUser } from "@/features/login/functions/login";
import { loginSchema } from "@/features/login/schema/login.schema";

export const useLogin = () => {
    const form = useForm({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const navigate = useNavigate();
    const loginFn = useServerFn(loginUser);

    const { mutate: submitLogin, isPending } = useMutation({
        mutationFn: loginFn,
        onSuccess: () => {
            navigate({ to: "/bookings" });
        },
        onError: (error) => {
            console.log("error", error);
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        submitLogin({ data: values });
    });

    return { form, onSubmit, isPending };
};
