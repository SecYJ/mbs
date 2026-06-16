import {
    bookingCalendarRoomCatalogQueryOptions,
    bookingCalendarRoomsQueryOptions,
    bookingCalendarSummaryQueryOptions,
    type BookingCalendarRoomCatalog,
    type BookingCalendarRooms,
    type BookingCalendarSummary as BookingCalendarSummaryData,
} from "@/features/bookings/services/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

const selectBookingStats = (data: BookingCalendarSummaryData) => ({
    bookingCount: data.bookingCount,
    liveBookingCount: data.liveBookingCount,
});
const selectRoomsShownCount = (data: BookingCalendarRooms) => data.rooms.length;
const selectTotalRoomCount = (data: BookingCalendarRoomCatalog) => data.totalRoomCount;

export const BookingCalendarSummary = () => {
    const {
        data: { bookingCount, liveBookingCount },
    } = useSuspenseQuery({
        ...bookingCalendarSummaryQueryOptions(),
        select: selectBookingStats,
    });
    const { capacity, equipment, location } = useSearch({ from: "/_bookings/bookings" });
    const { data: roomsShownCount } = useSuspenseQuery({
        ...bookingCalendarRoomsQueryOptions({ capacity, equipment, location }),
        select: selectRoomsShownCount,
    });
    const { data: totalRoomCount } = useSuspenseQuery({
        ...bookingCalendarRoomCatalogQueryOptions(),
        select: selectTotalRoomCount,
    });

    const roomsShown = `${roomsShownCount}/${totalRoomCount}`;

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
