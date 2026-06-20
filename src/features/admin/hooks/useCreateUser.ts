import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { createUserSchema } from "@/features/admin/schema/user.schema";
import { createUserFn } from "@/features/admin/services/users/fns";
import { userQueries } from "@/features/admin/services/users/queries";

type Options = {
    onSuccess?: () => void;
};

export const useCreateUser = ({ onSuccess }: Options) => {
    const form = useForm({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "user" as const,
        },
    });

    const createUser = useServerFn(createUserFn);

    const { mutate: submitCreateUser, isPending } = useMutation({
        mutationFn: createUser,
        onSuccess: (_1, _2, _3, context) => {
            context.client.invalidateQueries({ queryKey: userQueries.lists() });
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
                role: values.role,
            },
        });
    });

    return { form, onSubmit, isPending };
};
