import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { updateRoomBookingRulesSchema } from "@/features/admin/schema/room.schema";
import { updateRoomBookingRulesFn } from "@/features/admin/services/rooms/fns";
import { roomsQueryKey } from "@/features/admin/services/rooms/queries";
import { adminToast } from "@/features/admin/utils/admin-toast";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";

type Defaults = {
    roomId: string;
    maxBookingDurationHours: number;
};

export const useUpdateRoomBookingRules = (defaults: Defaults) => {
    const queryClient = useQueryClient();
    const updateRules = useServerFn(updateRoomBookingRulesFn);
    const form = useForm({
        resolver: zodResolver(updateRoomBookingRulesSchema),
        defaultValues: defaults,
    });

    const { mutate: submit, isPending } = useMutation({
        mutationFn: updateRules,
        onSuccess: ({ room }) => {
            queryClient.invalidateQueries({ queryKey: roomsQueryKey });
            queryClient.invalidateQueries({ queryKey: bookingCalendarQueryOptions().queryKey });
            form.reset({
                roomId: room.roomId,
                maxBookingDurationHours: room.maxBookingDurationHours,
            });
            adminToast("Room booking rules updated");
        },
        onError: (error) => {
            const message = error.message || "Failed to update room booking rules";
            form.setError("root", { message });
            adminToast(message, "danger");
        },
    });

    const onSubmit = form.handleSubmit((values) => submit({ data: values }));

    return { form, onSubmit, isPending };
};
