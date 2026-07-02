import { useSuspenseQueries } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { Building2, FilterX, Plus } from "lucide-react";
import { useDeferredValue } from "react";

import { AvailabilityCalendar } from "@/features/bookings/components/calendar/AvailabilityCalendar";
import { EmptyState } from "@/features/bookings/components/calendar/EmptyState";
import {
    bookingCalendarQueries,
    type BookingCalendarData,
    type BookingCalendarRoomCatalog,
    type BookingCalendarRooms,
} from "@/features/bookings/services/queries";
import { isAdminRole } from "@/lib/roles";

export const CalendarPanel = () => {
    const search = useSearch({ from: "/_bookings/bookings" });
    const deferredSearch = useDeferredValue(search);

    const { currentUserRole, showCalendar, showFilterZeroState, showNoRoomsState } = useSuspenseQueries({
        queries: [
            {
                ...bookingCalendarQueries.data(),
                select: (data: BookingCalendarData) => data.currentUserRole,
            },
            {
                ...bookingCalendarQueries.rooms(deferredSearch),
                select: (data: BookingCalendarRooms) => data.rooms.length > 0,
            },
            {
                ...bookingCalendarQueries.roomCatalog(),
                select: (data: BookingCalendarRoomCatalog) => data.totalRoomCount > 0,
            },
        ],
        combine: ([{ data: userRole }, { data: hasFilteredRooms }, { data: hasRooms }]) => ({
            currentUserRole: userRole,
            showCalendar: hasRooms && hasFilteredRooms,
            showFilterZeroState: hasRooms && !hasFilteredRooms,
            showNoRoomsState: !hasRooms,
        }),
    });

    if (showNoRoomsState) {
        return (
            <EmptyState
                icon={Building2}
                eyebrow="Inventory"
                title="No rooms to book yet"
                description="Add meeting rooms before guests can browse availability or reserve time on the calendar."
                action={
                    isAdminRole(currentUserRole) ? (
                        <Link
                            to="/admin/rooms"
                            className="group flex items-center justify-center gap-3 border border-(--bone) bg-(--bone) px-5 py-3 text-[0.66rem] font-semibold tracking-[0.28em] text-black uppercase no-underline transition-all hover:bg-white hover:tracking-[0.32em]"
                        >
                            <Plus className="size-4 transition-transform duration-300 group-hover:rotate-90" />
                            <span>Manage Rooms</span>
                        </Link>
                    ) : null
                }
            />
        );
    }

    if (showFilterZeroState) {
        return (
            <EmptyState
                icon={FilterX}
                eyebrow="Refine"
                title="No rooms match these filters"
                description="Loosen the capacity, equipment, or location filters to bring available rooms back into view."
                action={
                    <Link
                        from="/bookings"
                        to="."
                        className="flex items-center justify-center gap-3 border border-(--bone) bg-(--bone) px-5 py-3 text-[0.66rem] font-semibold tracking-[0.28em] text-black uppercase no-underline transition-all hover:bg-white hover:tracking-[0.32em]"
                    >
                        <FilterX className="size-4" strokeWidth={1.6} />
                        <span>Reset Filters</span>
                    </Link>
                }
            />
        );
    }

    if (showCalendar) {
        return <AvailabilityCalendar />;
    }

    return null;
};
