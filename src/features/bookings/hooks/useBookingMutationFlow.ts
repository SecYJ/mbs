import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import type { BookingFormData } from "@/features/bookings/components/booking-reservation-editor.types";
import { cancelBookingFn, createBookingFn, updateBookingFn } from "@/features/bookings/services/fns";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";

export const useBookingMutationFlow = ({ onCompleted }: { onCompleted: () => void }) => {
    const queryClient = useQueryClient();
    const createBooking = useServerFn(createBookingFn);
    const updateBooking = useServerFn(updateBookingFn);
    const cancelBooking = useServerFn(cancelBookingFn);

    const handleSuccess = async () => {
        await Promise.all([
            queryClient.invalidateQueries(bookingCalendarQueryOptions()),
            queryClient.invalidateQueries(notificationsQueryOptions()),
        ]);
        onCompleted();
    };

    const createBookingMutation = useMutation({
        mutationFn: createBooking,
        onSuccess: handleSuccess,
    });

    const updateBookingMutation = useMutation({
        mutationFn: updateBooking,
        onSuccess: handleSuccess,
    });

    const cancelBookingMutation = useMutation({
        mutationFn: cancelBooking,
        onSuccess: handleSuccess,
    });

    const reset = () => {
        createBookingMutation.reset();
        updateBookingMutation.reset();
        cancelBookingMutation.reset();
    };

    const submitBooking = (formData: BookingFormData) => {
        createBookingMutation.mutate({
            data: {
                title: formData.title,
                roomId: formData.roomId,
                startTime: formData.start.toISOString(),
                endTime: formData.end.toISOString(),
                attendeeIds: formData.attendeeIds,
                description: formData.description,
            },
        });
    };

    const updateBookingReservation = (bookingId: string, formData: BookingFormData) => {
        updateBookingMutation.mutate({
            data: {
                bookingId,
                title: formData.title,
                roomId: formData.roomId,
                startTime: formData.start.toISOString(),
                endTime: formData.end.toISOString(),
                attendeeIds: formData.attendeeIds,
                description: formData.description,
            },
        });
    };

    const cancelBookingReservation = (bookingId: string, cancelReason: string) => {
        cancelBookingMutation.mutate({ data: { bookingId, cancelReason } });
    };

    const createError = createBookingMutation.error instanceof Error ? createBookingMutation.error.message : null;
    const updateError = updateBookingMutation.error instanceof Error ? updateBookingMutation.error.message : null;
    const cancelError = cancelBookingMutation.error instanceof Error ? cancelBookingMutation.error.message : null;

    return {
        cancelBookingReservation,
        cancelError,
        createError,
        isCancelling: cancelBookingMutation.isPending,
        isSubmitting: createBookingMutation.isPending,
        isUpdating: updateBookingMutation.isPending,
        reset,
        submitBooking,
        updateBookingReservation,
        updateError,
    };
};
