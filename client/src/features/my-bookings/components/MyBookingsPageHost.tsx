import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { EmptyBookings } from "@/features/my-bookings/components/EmptyBookings";
import { MyBookingsFilterControls } from "@/features/my-bookings/components/MyBookingsFilterControls";
import { MyBookingsFilteredPage } from "@/features/my-bookings/components/MyBookingsFilteredPage";

const Route = getRouteApi("/_bookings/my-bookings");

export function MyBookingsPageHost() {
    const { myBookingsStatsQueryOptions } = Route.useRouteContext();

    const { data: hasBookings } = useSuspenseQuery({
        ...myBookingsStatsQueryOptions,
        select: (data) => data.ownedCount + data.attendingCount > 0,
    });

    if (hasBookings) {
        return (
            <>
                <MyBookingsFilterControls />
                <MyBookingsFilteredPage />
            </>
        );
    }

    return <EmptyBookings hasQuery={false} />;
}
