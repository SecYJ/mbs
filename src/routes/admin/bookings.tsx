import { createFileRoute } from "@tanstack/react-router";

import { BookingsPage } from "@/features/admin/pages/bookings-page";
import {
    ADMIN_BOOKING_SEARCH_DEFAULTS,
    adminBookingsSearchSchema,
} from "@/features/admin/schema/bookings-search.schema";
import { stripDefaultSearchParams } from "@/lib/router-search";

export const Route = createFileRoute("/admin/bookings")({
    validateSearch: adminBookingsSearchSchema,
    search: {
        middlewares: [stripDefaultSearchParams(ADMIN_BOOKING_SEARCH_DEFAULTS)],
    },
    component: BookingsPage,
});
