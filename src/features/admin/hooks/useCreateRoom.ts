import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { createRoomSchema } from "@/features/admin/schema/room.schema";
import { createRoomFn } from "@/features/admin/services/rooms/fns";
import { useRouter } from "@tanstack/react-router";

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
            maxBookingDurationHours: 4,
            available: true,
        },
    });

    const router = useRouter();
    const createRoom = useServerFn(createRoomFn);

    const { mutate: submitCreateRoom, isPending } = useMutation({
        mutationFn: createRoom,
        onSuccess: () => {
            form.reset();
            onSuccess?.();
            router.invalidate();
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
