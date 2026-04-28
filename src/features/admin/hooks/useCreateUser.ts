"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { createUserSchema } from "@/features/admin/schema/user.schema";
import { createUserFn } from "@/features/admin/services/users/fns";
import { usersQueryOptions } from "@/features/admin/services/users/queries";

type Options = {
    onSuccess?: () => void;
};

export const useCreateUser = ({ onSuccess }: Options = {}) => {
    const form = useForm({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const queryClient = useQueryClient();
    const createUser = useServerFn(createUserFn);

    const { mutate: submitCreateUser, isPending } = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: usersQueryOptions().queryKey });
            form.reset();
            onSuccess?.();
        },
        onError: (error) => {
            form.setError("root", { message: error.message ?? "Failed to create user" });
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        submitCreateUser({
            data: {
                name: values.name,
                email: values.email,
                password: values.password,
            },
        });
    });

    return { form, onSubmit, isPending };
};
