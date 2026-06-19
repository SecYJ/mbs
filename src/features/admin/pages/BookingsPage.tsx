import { Filter } from "lucide-react";

import { adminSelectClasses } from "@/features/admin/admin-classes";
import { AdminBookingStats } from "@/features/admin/components/AdminBookingStats";
import { AdminBookingsTable } from "@/features/admin/components/AdminBookingsTable";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminSearchInput } from "@/features/admin/components/AdminSearchInput";
import { useAdminBookingsPage } from "@/features/admin/hooks/useAdminBookingsPage";
import type { AdminBookingFilters } from "@/features/admin/services/bookings/queries";

export const BookingsPage = () => {
    const {
        beginCancellation,
        bookings,
        bookingStats,
        cancellationFields,
        form,
        cancellingBookingId,
        dismissCancellation,
        filters,
        isFiltering,
        rooms,
        submitCancellation,
        updateSearch,
    } = useAdminBookingsPage();

    return (
        <div>
            <AdminHeader title="All Bookings" />

            <div className="p-6">
                <AdminBookingStats {...bookingStats} />

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
                    <AdminBookingsTable
                        beginCancellation={beginCancellation}
                        bookings={bookings}
                        cancellationFields={cancellationFields}
                        form={form}
                        cancellingBookingId={cancellingBookingId}
                        dismissCancellation={dismissCancellation}
                        submitCancellation={submitCancellation}
                    />
                </div>
            </div>
        </div>
    );
};
