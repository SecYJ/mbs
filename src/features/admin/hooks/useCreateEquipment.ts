"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";

import { createEquipmentFn } from "@/features/admin/services/equipment/fns";
import { equipmentQueryOptions } from "@/features/admin/services/equipment/queries";
import { createEquipmentSchema } from "@/features/admin/schema/equipment.schema";

type Options = {
    onSuccess?: () => void;
};

export const useCreateEquipment = ({ onSuccess }: Options = {}) => {
    const form = useForm({
        resolver: zodResolver(createEquipmentSchema),
        defaultValues: {
            name: "",
            brand: "",
            model: "",
            price: 0,
            quantity: 1,
            purchaseDate: new Date().toISOString().slice(0, 10),
            warrantyExpiry: "",
        },
    });

    const queryClient = useQueryClient();
    const createEquipment = useServerFn(createEquipmentFn);

    const { mutate: submitCreateEquipment, isPending } = useMutation({
        mutationFn: createEquipment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: equipmentQueryOptions().queryKey });
            form.reset();
            onSuccess?.();
        },
        onError: (error) => {
            form.setError("root", { message: error.message ?? "Failed to create equipment" });
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        submitCreateEquipment({ data: values });
    });

    return { form, onSubmit, isPending };
};
