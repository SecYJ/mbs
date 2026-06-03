"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Filter } from "lucide-react";

import { adminSelectClasses } from "@/features/admin/admin-classes";
import { AdminBookingStats } from "@/features/admin/components/admin-booking-stats";
import { AdminBookingsTable } from "@/features/admin/components/admin-bookings-table";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { adminBookingsQueryOptions, type AdminBookingFilters } from "@/features/admin/services/bookings/queries";

type AdminBookingSearchUpdate = Partial<AdminBookingFilters>;

export const BookingsPage = () => {
    const filters = useSearch({ from: "/admin/bookings" });
    const navigate = useNavigate({ from: "/admin/bookings" });
    const {
        data: { rooms },
    } = useSuspenseQuery(adminBookingsQueryOptions(filters));

    const updateSearch = (next: AdminBookingSearchUpdate) => {
        navigate({
            search: (prev) => ({ ...prev, ...next }),
            replace: true,
        });
    };

    return (
        <div>
            <AdminHeader
                title="All Bookings"
                searchPlaceholder="Search bookings..."
                searchValue={filters.q}
                onSearchChange={(value) => updateSearch({ q: value })}
            />

            <div className="p-6">
                <AdminBookingStats />

                <div
                    className="mb-4 flex items-center gap-3 rounded-lg px-4 py-2.5"
                    style={{
                        background: "var(--a-surface-0)",
                        border: "1px solid var(--a-border)",
                    }}
                >
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

                <AdminBookingsTable />
            </div>
        </div>
    );
};
