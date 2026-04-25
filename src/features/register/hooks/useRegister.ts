import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { registerUser } from "@/features/register/functions/register";
import { registerSchema } from "@/features/register/schema/register.schema";

export const useRegister = () => {
    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "JaneDoe",
            email: "tes@gmail.com",
            password: "123456789",
            confirmPassword: "123456789",
        },
    });

    const navigate = useNavigate();
    const registerFn = useServerFn(registerUser);

    const { mutate: submitRegister } = useMutation({
        mutationFn: registerFn,
        onSuccess: () => {
            navigate({ to: "/bookings" });
        },
        onError: (error) => {
            console.log("error", error);
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        submitRegister({
            data: {
                email: values.email,
                name: values.name,
                password: values.password,
            },
        });
    });

    return { form, onSubmit };
};
