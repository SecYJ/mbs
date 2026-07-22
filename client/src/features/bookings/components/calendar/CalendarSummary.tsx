import { useSuspenseQueries } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import {
    bookingCalendarQueries,
    type BookingCalendarRoomCatalog,
    type BookingCalendarRooms,
    type CalendarSummary as CalendarSummaryData,
} from "@/features/bookings/services/queries";

export const CalendarSummary = () => {
    const { capacity, equipment, location } = useSearch({ from: "/_bookings/bookings" });

    const { bookingCount, liveBookingCount, roomsShown } = useSuspenseQueries({
        queries: [
            {
                ...bookingCalendarQueries.summary(),
                select: (data: CalendarSummaryData) => ({
                    bookingCount: data.bookingCount,
                    liveBookingCount: data.liveBookingCount,
                }),
            },
            {
                ...bookingCalendarQueries.rooms({ capacity, equipment, location }),
                select: (data: BookingCalendarRooms) => data.rooms.length,
            },
            {
                ...bookingCalendarQueries.roomCatalog(),
                select: (data: BookingCalendarRoomCatalog) => data.totalRoomCount,
            },
        ],
        combine: ([{ data: summary }, { data: roomsShownCount }, { data: totalRoomCount }]) => ({
            bookingCount: summary.bookingCount,
            liveBookingCount: summary.liveBookingCount,
            roomsShown: `${roomsShownCount}/${totalRoomCount}`,
        }),
    });

    return (
        <div className="grid grid-cols-3 items-stretch divide-x divide-(--hairline) border-y border-(--hairline) py-2 xl:border-y-0 xl:py-0">
            <BookingCalendarStat label="Bookings" value={bookingCount} />
            <BookingCalendarStat label="Rooms Shown" value={roomsShown} />
            <BookingCalendarStat label="In Session" value={liveBookingCount} />
        </div>
    );
};

const BookingCalendarStat = ({ label, value }: { label: string; value: number | string }) => (
    <div className="space-y-1.5 py-1 pr-4 pl-0 first:pl-0 sm:pl-5 sm:first:pl-0">
        <span className="eyebrow">{label}</span>
        <div className="flex items-baseline gap-2">
            <span className="tabular-num text-[1.55rem] leading-none font-normal text-(--signal)">{value}</span>
        </div>
    </div>
);
