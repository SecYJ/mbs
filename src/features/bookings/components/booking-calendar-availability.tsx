import type { ComponentProps } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, FilterX, Plus } from "lucide-react";

import { BookingAvailabilityCalendar } from "@/features/bookings/components/booking-availability-calendar";
import { BookingEmptyState } from "@/features/bookings/components/booking-empty-state";
import { BookingRoomList } from "@/features/bookings/components/booking-room-list";
import { bookingCalendarSearchDefaults } from "@/features/bookings/schemas/booking-calendar-search.schema";
import type { BookingCalendarData } from "@/features/bookings/services/queries";

type AvailabilityCalendarProps = ComponentProps<typeof BookingAvailabilityCalendar>;

export const BookingCalendarAvailability = ({
    accentByRoomId,
    currentUserRole,
    events,
    filteredRooms,
    onEventClick,
    onSelect,
    resources,
    showCalendar,
    showFilterZeroState,
    showNoRoomsState,
    view,
}: {
    accentByRoomId: AvailabilityCalendarProps["accentByRoomId"];
    currentUserRole: BookingCalendarData["currentUserRole"];
    events: AvailabilityCalendarProps["events"];
    filteredRooms: ComponentProps<typeof BookingRoomList>["rooms"];
    onEventClick: AvailabilityCalendarProps["onEventClick"];
    onSelect: AvailabilityCalendarProps["onSelect"];
    resources: AvailabilityCalendarProps["resources"];
    showCalendar: boolean;
    showFilterZeroState: boolean;
    showNoRoomsState: boolean;
    view: AvailabilityCalendarProps["view"];
}) => (
    <>
        {showCalendar && <BookingRoomList accentByRoomId={accentByRoomId} rooms={filteredRooms} />}

        {showNoRoomsState ? (
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
        ) : showFilterZeroState ? (
            <BookingEmptyState
                icon={FilterX}
                eyebrow="Refine"
                title="No rooms match these filters"
                description="Loosen the capacity, equipment, or location filters to bring available rooms back into view."
                action={
                    <Link
                        from="/bookings"
                        to="."
                        search={(prev) => ({
                            ...prev,
                            capacity: bookingCalendarSearchDefaults.capacity,
                            equipment: bookingCalendarSearchDefaults.equipment,
                            location: bookingCalendarSearchDefaults.location,
                        })}
                        className="flex items-center justify-center gap-3 border border-(--bone) bg-(--bone) px-5 py-3 text-[0.66rem] font-semibold tracking-[0.28em] text-black uppercase no-underline transition-all hover:bg-white hover:tracking-[0.32em]"
                    >
                        <FilterX className="size-4" strokeWidth={1.6} />
                        <span>Reset Filters</span>
                    </Link>
                }
            />
        ) : (
            <BookingAvailabilityCalendar
                accentByRoomId={accentByRoomId}
                events={events}
                onEventClick={onEventClick}
                onSelect={onSelect}
                resources={resources}
                view={view}
            />
        )}
    </>
);
