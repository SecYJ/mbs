import { useDeferredValue, useMemo } from "react";
import { useSearch } from "@tanstack/react-router";

import type { AdminBookingFilters } from "@/features/admin/services/bookings/queries";

export const useAdminBookingFilters = () => {
    const filters = useSearch({ from: "/admin/bookings" });
    const q = useDeferredValue(filters.q);
    const room = useDeferredValue(filters.room);
    const status = useDeferredValue(filters.status);

    const deferredFilters = useMemo<AdminBookingFilters>(() => ({ q, room, status }), [q, room, status]);

    return {
        filters,
        deferredFilters,
        isFiltering: filters.q !== q || filters.room !== room || filters.status !== status,
    };
};
