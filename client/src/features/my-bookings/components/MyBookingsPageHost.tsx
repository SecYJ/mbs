import { useSuspenseQueries } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useDeferredValue } from "react";

import { EmptyBookings } from "@/features/my-bookings/components/EmptyBookings";
import { MyBookingsFilterControls } from "@/features/my-bookings/components/MyBookingsFilterControls";
import { MyBookingsFilteredPage } from "@/features/my-bookings/components/MyBookingsFilteredPage";
import {
    myBookingsQueries,
    type MyBookingsQueryData,
    type MyBookingsStatsQueryData,
} from "@/features/my-bookings/services/queries";

const Route = getRouteApi("/_bookings/my-bookings");

export const MyBookingsPageHost = () => {
    const { group, q } = Route.useSearch();
    const deferredQ = useDeferredValue(q);

    const hasBookings = useSuspenseQueries({
        queries: [
            {
                ...myBookingsQueries.list({ group, q: deferredQ }),
                select: (data: MyBookingsQueryData) => data.history.length > 0,
            },
            {
                ...myBookingsQueries.stats(),
                select: (data: MyBookingsStatsQueryData) => data.ownedCount + data.attendingCount > 0,
            },
        ],
        combine: (result) => result.some((query) => query.data),
    });

    if (hasBookings) {
        return (
            <>
                <MyBookingsFilterControls />
                {hasBookings ? <MyBookingsFilteredPage /> : <EmptyBookings hasQuery={q.trim().length > 0} />}
            </>
        );
    }

    return <EmptyBookings hasQuery={false} />;
};
