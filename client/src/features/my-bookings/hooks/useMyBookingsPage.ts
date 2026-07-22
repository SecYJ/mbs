import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useFormContext, useWatch } from "react-hook-form";

import { cancelBookingFn, rsvpBookingInviteFn } from "@/features/bookings/services/fns";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";
import type { BookingCancellationFormValues } from "@/features/my-bookings/components/MyBookingsFormProvider";
import { myBookingsQueries } from "@/features/my-bookings/services/queries";
import { notificationQueries } from "@/features/notifications/services/queries";

export const useMyBookingsPage = () => {
    const cancelBooking = useServerFn(cancelBookingFn);
    const rsvpBookingInvite = useServerFn(rsvpBookingInviteFn);
    const cancellationForm = useFormContext<BookingCancellationFormValues>();

    const activeCancellationBookingId = useWatch({
        control: cancellationForm.control,
        name: "bookingId",
    });

    const cancelMutation = useMutation({
        mutationFn: cancelBooking,
        onSuccess: (_data, _variables, _onMutateResult, context) => {
            return Promise.all([
                context.client.invalidateQueries({ queryKey: myBookingsQueries.all() }),
                context.client.invalidateQueries(bookingCalendarQueries.data()),
                context.client.invalidateQueries(notificationQueries.list()),
            ]);
        },
    });

    const rsvpMutation = useMutation({
        mutationFn: rsvpBookingInvite,
        onSuccess: (_data, _variables, _onMutateResult, context) => {
            return Promise.all([
                context.client.invalidateQueries({ queryKey: myBookingsQueries.all() }),
                context.client.invalidateQueries(bookingCalendarQueries.data()),
                context.client.invalidateQueries(notificationQueries.list()),
            ]);
        },
    });

    const clearCancellation = (bookingId: string) => {
        if (cancellationForm.getValues("bookingId") !== bookingId) return;

        cancellationForm.reset({ bookingId: null, reason: "" });
    };

    const requestCancellation = (bookingId: string) => {
        if (cancellationForm.getValues("bookingId") === bookingId) return;

        cancellationForm.reset({ bookingId, reason: "" });
    };

    const submitCancellation = (bookingId: string) => {
        if (cancellationForm.getValues("bookingId") !== bookingId) return;

        cancellationForm.handleSubmit(({ reason }) => {
            cancelMutation.mutate(
                {
                    data: {
                        bookingId,
                        cancelReason: reason,
                    },
                },
                {
                    onSuccess: () => clearCancellation(bookingId),
                },
            );
        })();
    };

    return {
        activeCancellationBookingId,
        cancelMutation,
        clearCancellation,
        requestCancellation,
        rsvpMutation,
        submitCancellation,
    };
};
