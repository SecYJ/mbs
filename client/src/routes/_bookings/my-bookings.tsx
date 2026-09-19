import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import z from "zod";

import { MY_BOOKING_GROUPS, myBookingsSearchDefaults } from "@/features/my-bookings/my-bookings.constants";
import { MyBookingsPage } from "@/features/my-bookings/pages/MyBookingsPage";
import { myBookingsQueries } from "@/features/my-bookings/services/queries";

export const Route = createFileRoute("/_bookings/my-bookings")({
    validateSearch: z.object({
        group: z.enum(MY_BOOKING_GROUPS).catch("upcoming").optional(),
        q: z.string().catch(myBookingsSearchDefaults.q).prefault(myBookingsSearchDefaults.q),
    }),
    loaderDeps: ({ search }) => ({
        group: search.group ?? myBookingsSearchDefaults.group,
        q: search.q,
    }),
    search: {
        middlewares: [stripSearchParams(myBookingsSearchDefaults)],
    },
    context: ({ deps }) => ({
        myBookingsListQueryOptions: myBookingsQueries.list({ group: deps.group, q: deps.q }),
        myBookingsStatsQueryOptions: myBookingsQueries.stats(),
    }),
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(context.myBookingsListQueryOptions);
        context.queryClient.ensureQueryData(context.myBookingsStatsQueryOptions);
    },

    head: () => ({
        meta: [{ title: "My Bookings | Meridian" }],
    }),
    component: MyBookingsPage,
});
