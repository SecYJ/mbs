import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { useDeferredValue } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { cancelAdminBookingFn } from "@/features/admin/services/bookings/fns";
import { adminBookingQueries, type AdminBookingsQueryData } from "@/features/admin/services/bookings/queries";
import { isSuperAdminRole } from "@/lib/roles";

type AdminBookingCancellationFormValues = {
    cancellations: {
        bookingId: string;
        reason: string;
    }[];
};

const getBookingStatus = ({ endTime, startTime, status }: { endTime: string; startTime: string; status: string }) => {
    if (status === "cancelled") return "cancelled";

    const now = Date.now();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (now < start) return "upcoming";
    if (now < end) return "in-progress";
    return "completed";
};

const formatBookingTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    return `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`;
};

const selectAdminBookings = (data: AdminBookingsQueryData) =>
    data.bookings.map((row) => ({
        id: row.id,
        title: row.title,
        room: row.room,
        bookedBy: row.bookedBy,
        userId: row.userId,
        canCancel: row.userId === data.currentUserId || isSuperAdminRole(data.currentUserRole),
        attendees: row.attendees,
        date: format(new Date(row.startTime), "yyyy-MM-dd"),
        time: formatBookingTime(row.startTime, row.endTime),
        startTime: row.startTime,
        endTime: row.endTime,
        status: getBookingStatus(row),
    }));

const Route = getRouteApi("/admin/bookings");

export const useAdminBookingsPage = () => {
    const filters = Route.useSearch();

    const q = useDeferredValue(filters.q);
    const room = useDeferredValue(filters.room);
    const status = useDeferredValue(filters.status);
    const deferredFilters = { q, room, status };

    const cancelAdminBooking = useServerFn(cancelAdminBookingFn);

    const bookingsQueryOptions = adminBookingQueries.list(deferredFilters);

    const { data: bookings } = useSuspenseQuery({ ...bookingsQueryOptions, select: selectAdminBookings });

    const form = useForm<AdminBookingCancellationFormValues>({
        defaultValues: { cancellations: [] },
    });

    const {
        append,
        fields: cancellationFields,
        remove,
    } = useFieldArray({
        control: form.control,
        name: "cancellations",
    });

    const getCancellationIndex = (bookingId: string) => {
        return form.getValues("cancellations").findIndex((cancellation) => cancellation.bookingId === bookingId);
    };

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
            toast.error(error instanceof Error ? error.message : "Failed to cancel booking");
        },
    });

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
                    cancelReason: form.getValues(`cancellations.${cancellationIndex}.reason`),
                },
            },
            {
                onSuccess: async (_1, _2, _3, context) => {
                    await Promise.all([
                        context.client.invalidateQueries(bookingsQueryOptions),
                        context.client.invalidateQueries(adminBookingQueries.stats()),
                    ]);
                    toast.error(`"${booking.title}" cancelled`);
                    removeCancellation(booking.id);
                },
            },
        );
    };

    return {
        beginCancellation,
        cancellationFields,
        form,
        cancellingBookingId: isCancelling ? cancellingVariables?.data.bookingId : null,
        dismissCancellation: removeCancellation,
        bookings,
        submitCancellation,
    };
};
