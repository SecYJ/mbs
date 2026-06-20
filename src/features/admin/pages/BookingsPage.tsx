import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Filter } from "lucide-react";
import { useDeferredValue } from "react";

import { adminSelectClasses } from "@/features/admin/admin-classes";
import { AdminBookingStats } from "@/features/admin/components/AdminBookingStats";
import { AdminBookingsTable } from "@/features/admin/components/AdminBookingsTable";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminSearchInput } from "@/features/admin/components/AdminSearchInput";
import { adminBookingQueries, type AdminBookingFilters } from "@/features/admin/services/bookings/queries";
import { cn } from "@/lib/utils";

const Route = getRouteApi("/admin/bookings");

export const BookingsPage = () => {
    const filters = Route.useSearch();
    const navigate = Route.useNavigate();

    const q = useDeferredValue(filters.q);
    const room = useDeferredValue(filters.room);
    const status = useDeferredValue(filters.status);

    const { data: rooms } = useSuspenseQuery({
        ...adminBookingQueries.list({ q, room, status }),
        select: (data) => data.rooms,
    });

    const isFiltering = filters.q !== q || filters.room !== room || filters.status !== status;

    const updateSearch = (next: Partial<AdminBookingFilters>) => {
        navigate({
            search: (prev) => ({ ...prev, ...next }),
            replace: true,
        });
    };

    return (
        <div>
            <AdminHeader title="All Bookings" />

            <div className="p-6">
                <AdminBookingStats />

                <div className="mb-4 flex items-center gap-3 rounded-lg border border-(--a-border) bg-(--a-surface-0) px-4 py-2.5">
                    <AdminSearchInput
                        value={filters.q}
                        onChange={(value) => updateSearch({ q: value })}
                        placeholder="Search bookings..."
                    />
                    <Filter className="size-3.5 text-(--a-text-muted)" strokeWidth={1.6} />
                    <select
                        className={adminSelectClasses}
                        value={filters.status}
                        onChange={(e) => updateSearch({ status: e.target.value as AdminBookingFilters["status"] })}
                    >
                        <option value="all">All statuses</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        className={adminSelectClasses}
                        value={filters.room}
                        onChange={(e) => updateSearch({ room: e.target.value })}
                    >
                        <option value="all">All rooms</option>
                        {rooms.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    {(filters.status !== "all" || filters.room !== "all") && (
                        <button
                            type="button"
                            onClick={() => {
                                updateSearch({ status: "all", room: "all" });
                            }}
                            className="ml-auto text-[0.75rem] font-medium text-(--a-accent) transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                <div className={cn("transition-opacity", isFiltering && "opacity-60")}>
                    <AdminBookingsTable />
                </div>
            </div>
        </div>
    );
};
