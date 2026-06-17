import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Filter } from "lucide-react";

import { adminSelectClasses } from "@/features/admin/admin-classes";
import { AdminBookingStats } from "@/features/admin/components/AdminBookingStats";
import { AdminBookingsTable } from "@/features/admin/components/AdminBookingsTable";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminSearchInput } from "@/features/admin/components/AdminSearchInput";
import { useAdminBookingFilters } from "@/features/admin/hooks/useAdminBookingFilters";
import { adminBookingsQueryOptions, type AdminBookingFilters } from "@/features/admin/services/bookings/queries";

const Route = getRouteApi("/admin/bookings");

export const BookingsPage = () => {
    const { filters, deferredFilters, isFiltering } = useAdminBookingFilters();
    const navigate = Route.useNavigate();
    const {
        data: { rooms },
    } = useSuspenseQuery(adminBookingsQueryOptions(deferredFilters));

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

                <div
                    className="mb-4 flex items-center gap-3 rounded-lg px-4 py-2.5"
                    style={{
                        background: "var(--a-surface-0)",
                        border: "1px solid var(--a-border)",
                    }}
                >
                    <AdminSearchInput
                        value={filters.q}
                        onChange={(value) => updateSearch({ q: value })}
                        placeholder="Search bookings..."
                    />
                    <Filter className="size-3.5" style={{ color: "var(--a-text-muted)" }} strokeWidth={1.6} />
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
                        {rooms.map((room) => (
                            <option key={room} value={room}>
                                {room}
                            </option>
                        ))}
                    </select>
                    {(filters.status !== "all" || filters.room !== "all") && (
                        <button
                            type="button"
                            onClick={() => {
                                updateSearch({ status: "all", room: "all" });
                            }}
                            className="ml-auto text-[0.75rem] font-medium transition-colors"
                            style={{ color: "var(--a-accent)" }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                <div className={isFiltering ? "opacity-60 transition-opacity" : "transition-opacity"}>
                    <AdminBookingsTable />
                </div>
            </div>
        </div>
    );
};
