import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { myBookingSectionMeta, myBookingsSearchDefaults } from "@/features/bookings/my-bookings.constants";
import { cancelBookingFn, rsvpBookingInviteFn } from "@/features/bookings/services/fns";
import {
    bookingCalendarQueryOptions,
    myBookingsQueryOptions,
    myBookingsStatsQueryOptions,
} from "@/features/bookings/services/queries";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";

const myBookingsRoute = getRouteApi("/_bookings/my-bookings");

export const useMyBookingsPage = () => {
    const { group, q, cancel } = myBookingsRoute.useSearch();
    const { data } = useSuspenseQuery(myBookingsQueryOptions({ group, q }));
    const navigate = myBookingsRoute.useNavigate();
    const queryClient = useQueryClient();
    const cancelBooking = useServerFn(cancelBookingFn);
    const rsvpBookingInvite = useServerFn(rsvpBookingInviteFn);

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
                queryClient.invalidateQueries(myBookingsQueryOptions({ group, q })),
                queryClient.invalidateQueries(myBookingsStatsQueryOptions()),
                queryClient.invalidateQueries(bookingCalendarQueryOptions()),
                queryClient.invalidateQueries(notificationsQueryOptions()),
            ]);

            navigate({
                search: (prev) => ({ ...prev, cancel: undefined }),
                replace: true,
            });
        },
    });

    const rsvpMutation = useMutation({
        mutationFn: rsvpBookingInvite,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries(myBookingsQueryOptions({ group, q })),
                queryClient.invalidateQueries(myBookingsStatsQueryOptions()),
                queryClient.invalidateQueries(bookingCalendarQueryOptions()),
                queryClient.invalidateQueries(notificationsQueryOptions()),
            ]);
        },
    });

    return {
        bookings: data.history,
        cancelId: cancel,
        cancelMutation,
        clearCancellation: () => updateSearch({ cancel: undefined }),
        currentUserId: data.currentUserId,
        requestCancellation: (bookingId: string) => updateSearch({ cancel: bookingId }),
        rsvpMutation,
        sectionMeta: myBookingSectionMeta[group],
        updateSearch,
    };
};
