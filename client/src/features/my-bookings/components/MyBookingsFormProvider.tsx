import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const bookingCancellationFormSchema = z.object({
    bookingId: z.uuid("Select a valid booking").nullable(),
    reason: z.string().trim().max(500, "Cancellation reason is too long").optional(),
});

export type BookingCancellationFormValues = z.infer<typeof bookingCancellationFormSchema>;

export const MyBookingsFormProvider = ({ children }: { children: ReactNode }) => {
    const form = useForm({
        resolver: zodResolver(bookingCancellationFormSchema),
        defaultValues: { bookingId: null, reason: "" },
    });

    return <FormProvider {...form}>{children}</FormProvider>;
};
