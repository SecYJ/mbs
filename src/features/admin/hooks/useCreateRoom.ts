import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createRoomSchema } from "@/features/admin/schema/room.schema";
import { createRoomFn } from "@/features/admin/services/rooms/fns";
import { roomQueries } from "@/features/admin/services/rooms/queries";

type UseCreateRoomOptions = {
    onOpenChange: (open: boolean) => void;
};

export const useCreateRoom = ({ onOpenChange }: UseCreateRoomOptions) => {
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

    const createRoom = useServerFn(createRoomFn);

    const { mutate: submitCreateRoom, isPending } = useMutation({
        mutationFn: createRoom,
        onSuccess: (_1, _2, _3, context) => {
            toast.success("Room created");
            form.reset();
            onOpenChange(false);

            context.client.invalidateQueries({ queryKey: roomQueries.lists() });
        },
        onError: (error) => {
            form.setError("root", { message: error.message ?? "Failed to create room" });
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        submitCreateRoom({ data: values });
    });

    const handleOpenChange = (nextOpen: boolean) => {
        if (isPending && !nextOpen) return;
        onOpenChange(nextOpen);
        if (!nextOpen) form.reset();
    };

    return { form, onSubmit, isPending, handleOpenChange };
};
