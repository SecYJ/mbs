import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { bookingCalendarQueries } from "@/features/bookings/services/queries";
import { useBookingCalendarStore } from "@/features/bookings/stores/BookingCalendarStore";
import { cn } from "@/lib/utils";

export const NewReservationButton = () => {
    const { openNewReservation } = useBookingCalendarStore((state) => state.actions);

    const { data: hasBookableRooms } = useSuspenseQuery({
        ...bookingCalendarQueries.roomCatalog(),
        select: (data) => data.totalRoomCount > 0,
    });

    return (
        <button
            type="button"
            onClick={() => openNewReservation()}
            disabled={!hasBookableRooms}
            className={cn(
                "group relative flex h-11 items-center justify-center gap-3 self-start border border-(--bone) bg-(--bone) px-6 text-[0.68rem] font-semibold tracking-[0.3em] text-black uppercase transition-colors duration-300 xl:self-center",
                hasBookableRooms ? "cursor-pointer hover:border-white hover:bg-white" : "cursor-not-allowed opacity-45",
            )}
        >
            <Plus className="size-4 transition-transform duration-300 group-hover:rotate-90" strokeWidth={1.8} />
            <span>New Booking</span>
        </button>
    );
};
