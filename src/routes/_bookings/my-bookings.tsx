import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { MyBookingsPage } from "@/features/bookings/pages/MyBookingsPage";
import { myBookingsSearchDefaults } from "@/features/bookings/my-bookings.constants";
import { myBookingsSearchSchema } from "@/features/bookings/schemas/my-bookings-search.schema";
import { myBookingsQueryOptions, myBookingsStatsQueryOptions } from "@/features/bookings/services/queries";

export const Route = createFileRoute("/_bookings/my-bookings")({
    validateSearch: myBookingsSearchSchema,
    search: {
        middlewares: [stripSearchParams(myBookingsSearchDefaults)],
    },
    loaderDeps: (loaderDeps) => loaderDeps.search,
    loader: ({ context: { queryClient }, deps }) => {
        queryClient.ensureQueryData(myBookingsQueryOptions({ group: deps.group, q: deps.q }));
        queryClient.ensureQueryData(myBookingsStatsQueryOptions());
    },
    component: MyBookingsPage,
});
