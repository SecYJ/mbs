import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateRoomSchema } from "@/features/admin/schema/room.schema";
import { updateRoomFn } from "@/features/admin/services/rooms/fns";
import { roomQueries } from "@/features/admin/services/rooms/queries";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";

type Props = {
    roomId: string;
    name: string;
    location: string;
    capacity: number;
    maxBookingDurationHours: number;
    available: boolean;
};

export const useUpdateRoom = (defaults: Props) => {
    const router = useRouter();
    const updateRoom = useServerFn(updateRoomFn);
    const form = useForm({
        resolver: zodResolver(updateRoomSchema),
        values: defaults,
    });

    const { mutate: submit, isPending } = useMutation({
        mutationFn: updateRoom,
        onSuccess: async (_1, variables, _3, context) => {
            await Promise.all([
                context.client.invalidateQueries(roomQueries.detail(variables.data.roomId)),
                context.client.invalidateQueries(bookingCalendarQueries.data()),
            ]);

            router.invalidate();

            toast.success("Room updated");
        },
        onError: (error) => {
            const message = error.message || "Failed to update room";
            form.setError("root", { message });
            toast.error(message);
        },
    });

    const onSubmit = form.handleSubmit((values) => submit({ data: values }));

    return { form, onSubmit, isPending };
};
