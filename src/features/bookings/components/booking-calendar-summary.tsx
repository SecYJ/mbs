import { useBookingCalendarSummary } from "@/features/bookings/hooks/useBookingCalendarSummary";
import { cn } from "@/lib/utils";

export const BookingCalendarSummary = () => {
    const { bookingCount, filteredRoomCount, liveBookingCount, totalRoomCount } = useBookingCalendarSummary();

    return (
        <div className="grid grid-cols-3 items-stretch divide-x divide-(--hairline) border-y border-(--hairline) py-2 xl:border-y-0 xl:py-0">
            <BookingCalendarStat label="Bookings" value={bookingCount} />
            <BookingCalendarStat label="Rooms Shown" value={`${filteredRoomCount}/${totalRoomCount}`} />
            <BookingCalendarStat
                label="In Session"
                value={liveBookingCount}
                accent={liveBookingCount > 0 ? "signal" : undefined}
            />
        </div>
    );
};

const BookingCalendarStat = ({
    label,
    value,
    accent,
}: {
    label: string;
    value: number | string;
    accent?: "signal";
}) => (
    <div className="space-y-1.5 py-1 pr-4 pl-0 first:pl-0 sm:pl-5 sm:first:pl-0">
        <span className="eyebrow">{label}</span>
        <div className="flex items-baseline gap-2">
            <span
                className={cn(
                    "tabular-num text-[1.55rem] leading-none font-normal",
                    accent === "signal" ? "text-(--signal)" : "text-(--bone)",
                )}
            >
                {value}
            </span>
            {accent === "signal" && (
                <span
                    className="size-1.5 rounded-full bg-(--signal)"
                    style={{ animation: "signal-pulse 900ms ease-in-out infinite" }}
                />
            )}
        </div>
    </div>
);
