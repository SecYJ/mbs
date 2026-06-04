import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { updateBookingRulesSchema } from "@/features/admin/schema/booking-rules.schema";
import { updateBookingRulesFn } from "@/features/admin/services/booking-rules/fns";
import { bookingRulesQueryOptions } from "@/features/admin/services/booking-rules/queries";
import { adminToast } from "@/features/admin/utils/admin-toast";

type Defaults = {
    maxBookingDurationHours: number;
};

export const useUpdateBookingRules = (defaults: Defaults) => {
    const queryClient = useQueryClient();
    const updateRules = useServerFn(updateBookingRulesFn);

    const form = useForm({
        resolver: zodResolver(updateBookingRulesSchema),
        defaultValues: defaults,
    });

    const { mutate: submit, isPending } = useMutation({
        mutationFn: updateRules,
        onSuccess: (row) => {
            queryClient.setQueryData(bookingRulesQueryOptions().queryKey, row);
            form.reset({ maxBookingDurationHours: row.maxBookingDurationHours });
            adminToast("Booking rules updated");
        },
        onError: (error) => {
            const message = error.message || "Failed to update rules";
            form.setError("root", { message });
            adminToast(message, "danger");
        },
    });

    const onSubmit = form.handleSubmit((values) => submit({ data: values }));

    return { form, onSubmit, isPending };
};
