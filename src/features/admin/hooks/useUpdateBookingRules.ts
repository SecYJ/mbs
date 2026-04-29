"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { useAdminToast } from "@/features/admin/components/admin-layout";
import { updateBookingRulesSchema } from "@/features/admin/schema/booking-rules.schema";
import { updateBookingRulesFn } from "@/features/admin/services/booking-rules/fns";
import { bookingRulesQueryOptions } from "@/features/admin/services/booking-rules/queries";

interface Defaults {
    maxBookingDurationHours: number;
}

export const useUpdateBookingRules = (defaults: Defaults) => {
    const { toast } = useAdminToast();
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
            toast("Booking rules updated", "success");
        },
        onError: (error) => {
            const message = error.message || "Failed to update rules";
            form.setError("root", { message });
            toast(message, "danger");
        },
    });

    const onSubmit = form.handleSubmit((values) => submit({ data: values }));

    return { form, onSubmit, isPending };
};
