"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { createRoomFn } from "@/features/admin/services/rooms/fns";
import { roomsQueryOptions } from "@/features/admin/services/rooms/queries";
import { createRoomSchema } from "@/features/admin/schema/room.schema";

type Options = {
    onSuccess?: () => void;
};

export const useCreateRoom = ({ onSuccess }: Options = {}) => {
    const form = useForm({
        resolver: zodResolver(createRoomSchema),
        defaultValues: {
            name: "",
            location: "",
            capacity: 1,
            available: true,
        },
    });

    const queryClient = useQueryClient();
    const createRoom = useServerFn(createRoomFn);

    const { mutate: submitCreateRoom, isPending } = useMutation({
        mutationFn: createRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roomsQueryOptions().queryKey });
            form.reset();
            onSuccess?.();
        },
        onError: (error) => {
            form.setError("root", { message: error.message ?? "Failed to create room" });
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        submitCreateRoom({ data: values });
    });

    return { form, onSubmit, isPending };
};
