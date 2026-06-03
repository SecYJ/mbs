"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useFieldArray, useForm } from "react-hook-form";

import { useAdminToast } from "@/features/admin/components/admin-layout";
import { cancelAdminBookingFn } from "@/features/admin/services/bookings/fns";
import {
    adminBookingStatsQueryOptions,
    adminBookingsQueryOptions,
    type AdminBookingFilters,
} from "@/features/admin/services/bookings/queries";

type AdminBookingSearchUpdate = Partial<AdminBookingFilters>;

type AdminBookingCancellationFormValues = {
    cancellations: Array<{
        bookingId: string;
        reason: string;
    }>;
};

export const useAdminBookingsPage = () => {
    const { toast } = useAdminToast();
    const filters = useSearch({ from: "/admin/bookings" });
    const navigate = useNavigate({ from: "/admin/bookings" });
    const queryClient = useQueryClient();
    const cancelAdminBooking = useServerFn(cancelAdminBookingFn);
    const bookingsQueryOptions = adminBookingsQueryOptions(filters);
    const bookingStatsQueryOptions = adminBookingStatsQueryOptions();
    const {
        data: { bookings, rooms },
    } = useSuspenseQuery(bookingsQueryOptions);
    const cancellationForm = useForm<AdminBookingCancellationFormValues>({
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

    const getCancellationIndex = (bookingId: string) =>
        cancellationForm.getValues("cancellations").findIndex((cancellation) => cancellation.bookingId === bookingId);

    const removeCancellation = (bookingId: string) => {
        const cancellationIndex = getCancellationIndex(bookingId);

        if (cancellationIndex !== -1) {
            remove(cancellationIndex);
        }
    };

    const {
        mutate: cancelBooking,
        isPending: isCancelling,
        variables: cancellingVariables,
    } = useMutation({
        mutationFn: cancelAdminBooking,
        onError: (error) => {
            toast(error instanceof Error ? error.message : "Failed to cancel booking", "danger");
        },
    });

    const updateSearch = (next: AdminBookingSearchUpdate) => {
        navigate({
            search: (prev) => ({ ...prev, ...next }),
            replace: true,
        });
    };

    const beginCancellation = (bookingId: string) => {
        if (getCancellationIndex(bookingId) === -1) {
            append({ bookingId, reason: "" });
        }
    };

    const submitCancellation = (booking: { id: string; title: string }) => {
        const cancellationIndex = getCancellationIndex(booking.id);

        if (cancellationIndex === -1) return;

        cancelBooking(
            {
                data: {
                    bookingId: booking.id,
                    cancelReason: cancellationForm.getValues(`cancellations.${cancellationIndex}.reason`),
                },
            },
            {
                onSuccess: async () => {
                    await Promise.all([
                        queryClient.invalidateQueries(bookingsQueryOptions),
                        queryClient.invalidateQueries(bookingStatsQueryOptions),
                    ]);
                    toast(`"${booking.title}" cancelled`, "danger");
                    removeCancellation(booking.id);
                },
            },
        );
    };

    return {
        beginCancellation,
        cancellationFields,
        cancellationForm,
        cancellingBookingId: isCancelling ? cancellingVariables?.data.bookingId : null,
        dismissCancellation: removeCancellation,
        filteredBookings: bookings,
        isCancelling,
        roomFilter: filters.room,
        rooms,
        search: filters.q,
        statusFilter: filters.status,
        submitCancellation,
        updateSearch,
    };
};
