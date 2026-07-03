import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { MY_BOOKING_GROUPS, myBookingsSearchDefaults } from "@/features/my-bookings/my-bookings.constants";
import { MyBookingsPage } from "@/features/my-bookings/pages/MyBookingsPage";
import { myBookingsQueries } from "@/features/my-bookings/services/queries";
import z from "zod";

export const Route = createFileRoute("/_bookings/my-bookings")({
    head: () => ({
        meta: [{ title: "My Bookings | Meridian" }],
    }),
    validateSearch: z.object({
        group: z.enum(MY_BOOKING_GROUPS).catch("upcoming").optional(),
        q: z.string().catch(myBookingsSearchDefaults.q).prefault(myBookingsSearchDefaults.q),
    }),
    search: {
        middlewares: [stripSearchParams(myBookingsSearchDefaults)],
    },
    loaderDeps: ({ search }) => ({
        group: search.group ?? myBookingsSearchDefaults.group,
        q: search.q,
    }),
    loader: ({ context: { queryClient }, deps }) => {
        queryClient.ensureQueryData(myBookingsQueries.list({ group: deps.group, q: deps.q }));
        queryClient.ensureQueryData(myBookingsQueries.stats());
    },
    component: MyBookingsPage,
});
