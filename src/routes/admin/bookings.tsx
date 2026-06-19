import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { AdminPending } from "@/features/admin/components/AdminPending";
import { BookingsPage } from "@/features/admin/pages/BookingsPage";
import { adminBookingQueries } from "@/features/admin/services/bookings/queries";
import {
    ADMIN_BOOKING_SEARCH_DEFAULTS,
    adminBookingsSearchSchema,
} from "@/features/admin/schema/bookings-search.schema";

export const Route = createFileRoute("/admin/bookings")({
    validateSearch: adminBookingsSearchSchema,
    search: {
        middlewares: [stripSearchParams(ADMIN_BOOKING_SEARCH_DEFAULTS)],
    },
    loaderDeps: (loaderDeps) => loaderDeps.search,
    loader: ({ context: { queryClient }, deps }) => {
        queryClient.ensureQueryData(adminBookingQueries.list(deps));
        queryClient.ensureQueryData(adminBookingQueries.stats());
    },
    component: BookingsPage,
    pendingComponent: AdminPending,
});
