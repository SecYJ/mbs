import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { cancelBookingFn, createBookingFn, updateBookingFn } from "@/features/bookings/services/fns";
import { BOOKING_MUTATION_KEYS } from "@/features/bookings/services/mutationOpts";
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
        mutationKey: BOOKING_MUTATION_KEYS.create,
        mutationFn: createBooking,
        onSuccess: handleSuccess,
    });

    const updateBookingMutation = useMutation({
        mutationKey: BOOKING_MUTATION_KEYS.update,
        mutationFn: updateBooking,
        onSuccess: handleSuccess,
    });

    const cancelBookingMutation = useMutation({
        mutationKey: BOOKING_MUTATION_KEYS.cancel,
        mutationFn: cancelBooking,
        onSuccess: handleSuccess,
    });

    return {
        cancelBookingMutation,
        createBookingMutation,
        updateBookingMutation,
    };
};
