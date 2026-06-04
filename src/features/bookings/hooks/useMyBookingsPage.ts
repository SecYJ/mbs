import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { myBookingSectionMeta, myBookingsSearchDefaults } from "@/features/bookings/my-bookings.constants";
import { cancelBookingFn, rsvpBookingInviteFn } from "@/features/bookings/services/fns";
import {
    bookingCalendarQueryOptions,
    myBookingsQueryKey,
    myBookingsQueryOptions,
    myBookingsStatsQueryOptions,
} from "@/features/bookings/services/queries";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";

const myBookingsRoute = getRouteApi("/_bookings/my-bookings");

const bookingCancellationFormSchema = z.object({
    cancellations: z
        .object({
            bookingId: z.uuid("Select a valid booking"),
            reason: z.string().trim().max(500, "Cancellation reason is too long").optional(),
        })
        .array(),
});

export const useMyBookingsPage = () => {
    const { group, q } = myBookingsRoute.useSearch();
    const { data } = useSuspenseQuery(myBookingsQueryOptions({ group, q }));
    const navigate = myBookingsRoute.useNavigate();
    const queryClient = useQueryClient();
    const cancelBooking = useServerFn(cancelBookingFn);
    const rsvpBookingInvite = useServerFn(rsvpBookingInviteFn);
    const cancellationForm = useForm({
        resolver: zodResolver(bookingCancellationFormSchema),
        defaultValues: { cancellations: [] },
    });
    const {
        append,
        fields: cancellationFields,
        remove,
    } = useFieldArray({
        control: cancellationForm.control,
        name: "cancellations",
    });

    const updateSearch = (next: Partial<typeof myBookingsSearchDefaults>) => {
        navigate({
            search: (prev) => ({ ...prev, ...next }),
            replace: true,
        });
    };

    const cancelMutation = useMutation({
        mutationFn: cancelBooking,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: myBookingsQueryKey }),
                queryClient.invalidateQueries(myBookingsStatsQueryOptions()),
                queryClient.invalidateQueries(bookingCalendarQueryOptions()),
                queryClient.invalidateQueries(notificationsQueryOptions()),
            ]);
        },
    });

    const rsvpMutation = useMutation({
        mutationFn: rsvpBookingInvite,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: myBookingsQueryKey }),
                queryClient.invalidateQueries(myBookingsStatsQueryOptions()),
                queryClient.invalidateQueries(bookingCalendarQueryOptions()),
                queryClient.invalidateQueries(notificationsQueryOptions()),
            ]);
        },
    });

    const getCancellationIndex = (bookingId: string) =>
        cancellationForm.getValues("cancellations").findIndex((cancellation) => cancellation.bookingId === bookingId);

    const clearCancellation = (bookingId: string) => {
        const cancellationIndex = getCancellationIndex(bookingId);

        if (cancellationIndex !== -1) {
            remove(cancellationIndex);
        }
    };

    const requestCancellation = (bookingId: string) => {
        if (getCancellationIndex(bookingId) === -1) {
            append({ bookingId, reason: "" });
        }
    };

    const submitCancellation = (bookingId: string) => {
        const cancellationIndex = getCancellationIndex(bookingId);

        if (cancellationIndex === -1) return;

        void cancellationForm.handleSubmit(() => {
            cancelMutation.mutate(
                {
                    data: {
                        bookingId,
                        cancelReason: cancellationForm.getValues(`cancellations.${cancellationIndex}.reason`),
                    },
                },
                {
                    onSuccess: () => clearCancellation(bookingId),
                },
            );
        })();
    };

    return {
        bookings: data.history,
        cancellationFields,
        cancellationForm,
        cancelMutation,
        clearCancellation,
        currentUserId: data.currentUserId,
        currentUserRole: data.currentUserRole,
        requestCancellation,
        rsvpMutation,
        sectionMeta: myBookingSectionMeta[group],
        submitCancellation,
        updateSearch,
    };
};
