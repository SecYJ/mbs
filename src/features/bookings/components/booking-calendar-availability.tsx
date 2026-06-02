import type { ComponentProps } from "react";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Link } from "@tanstack/react-router";
import { isPast } from "date-fns";
import { Building2, FilterX, Plus } from "lucide-react";

import { BookingAvailabilityCalendar } from "@/features/bookings/components/booking-availability-calendar";
import { BookingEmptyState } from "@/features/bookings/components/booking-empty-state";
import { useBookingCalendarAvailability } from "@/features/bookings/hooks/useBookingCalendarAvailability";
import { useBookingCalendarStore } from "@/features/bookings/stores/booking-calendar-store";
import { isPastCalendarEvent } from "@/features/bookings/utils/booking-calendar";

type AvailabilityCalendarProps = ComponentProps<typeof BookingAvailabilityCalendar>;

export const BookingCalendarAvailability = () => {
    const { currentUserRole, showCalendar, showFilterZeroState, showNoRoomsState } = useBookingCalendarAvailability();
    const { openExistingReservation, openNewReservation } = useBookingCalendarStore((state) => state.actions);

    const handleSelect: AvailabilityCalendarProps["onSelect"] = (info: DateSelectArg) => {
        if (isPast(info.start)) {
            return;
        }

        openNewReservation({
            roomId: info.resource?.id,
            start: info.start,
            end: info.end,
        });
    };

    const handleEventClick: AvailabilityCalendarProps["onEventClick"] = (info: EventClickArg) => {
        if (isPastCalendarEvent(info.event.toPlainObject())) {
            info.jsEvent.preventDefault();
            info.jsEvent.stopPropagation();
            return;
        }

        openExistingReservation(info.event.toPlainObject());
    };

    if (showNoRoomsState) {
        return (
            <BookingEmptyState
                icon={Building2}
                eyebrow="Inventory"
                title="No rooms to book yet"
                description="Add meeting rooms before guests can browse availability or reserve time on the calendar."
                action={
                    currentUserRole === "admin" ? (
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
            <BookingEmptyState
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
        return <BookingAvailabilityCalendar onEventClick={handleEventClick} onSelect={handleSelect} />;
    }

    return null;
};
