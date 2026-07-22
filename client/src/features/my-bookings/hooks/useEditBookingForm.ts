import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { addMinutes, startOfMinute } from "date-fns";
import { useForm } from "react-hook-form";

import { updateBookingFn } from "@/features/bookings/services/fns";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";
import type { BookingHistoryItem } from "@/features/my-bookings/my-bookings.constants";
import {
    createEditBookingValidator,
    toDateTimeLocal,
    type EditBookingFormValues,
} from "@/features/my-bookings/schemas/edit-booking.schema";
import { myBookingsQueries } from "@/features/my-bookings/services/queries";
import { notificationQueries } from "@/features/notifications/services/queries";

type UseEditBookingFormProps = {
    booking: BookingHistoryItem;
    onSuccess: () => void;
};

export const useEditBookingForm = ({ booking, onSuccess }: UseEditBookingFormProps) => {
    const { data: rooms } = useSuspenseQuery({
        ...bookingCalendarQueries.data(),
        select: (data) => data.rooms,
    });

    const defaultValues: EditBookingFormValues = {
        title: booking.title,
        roomId: booking.roomId,
        startTime: toDateTimeLocal(booking.start),
        endTime: toDateTimeLocal(booking.end),
        attendeeIds: booking.attendees.map((attendee) => attendee.id),
        description: booking.description ?? "",
    };

    const form = useForm({
        resolver: zodResolver(
            createEditBookingValidator({
                rooms,
                original: {
                    roomId: booking.roomId,
                    startTime: defaultValues.startTime,
                    endTime: defaultValues.endTime,
                },
            }),
        ),
        mode: "onChange",
        values: defaultValues,
    });

    const updateBooking = useServerFn(updateBookingFn);
    const updateBookingMutation = useMutation({
        mutationFn: updateBooking,
        onSuccess: async (_data, _variables, _onMutateResult, context) => {
            await Promise.all([
                context.client.invalidateQueries({ queryKey: myBookingsQueries.all() }),
                context.client.invalidateQueries(bookingCalendarQueries.data()),
                context.client.invalidateQueries(notificationQueries.list()),
            ]);

            onSuccess();
        },
    });

    const minimumStartTime = toDateTimeLocal(addMinutes(startOfMinute(new Date()), 1));

    const onSubmit = form.handleSubmit((values) =>
        updateBookingMutation.mutate({
            data: {
                bookingId: booking.id,
                title: values.title,
                roomId: values.roomId,
                startTime: new Date(values.startTime).toISOString(),
                endTime: new Date(values.endTime).toISOString(),
                attendeeIds: values.attendeeIds,
                description: values.description,
            },
        }),
    );

    return {
        form,
        isSubmitting: updateBookingMutation.isPending,
        minimumStartTime,
        rooms,
        serverError: updateBookingMutation.error instanceof Error ? updateBookingMutation.error.message : null,
        onSubmit,
    };
};
