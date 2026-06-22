import { formatDuration, intervalToDuration } from "date-fns";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import type { ReactNode } from "react";

import { useRoomDaySummaryModel } from "@/features/bookings/hooks/room-day/useRoomDaySummaryModel";
import { cn } from "@/lib/utils";

export const RoomDaySummary = () => {
    const { bookingCount, freeMinutes, liveEvent, room } = useRoomDaySummaryModel();

    if (!room) return null;

    return (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <RoomBookingStat
                icon={<MapPin className="size-4" strokeWidth={1.4} />}
                label="Location"
                value={room.location}
            />
            <RoomBookingStat
                icon={<Users className="size-4" strokeWidth={1.4} />}
                label="Capacity"
                value={`${room.capacity} people`}
            />
            <RoomBookingStat
                icon={<Clock className="size-4" strokeWidth={1.4} />}
                label="Free Today"
                value={formatFreeDuration(freeMinutes)}
            />
            <RoomBookingStat
                icon={<CalendarDays className="size-4" strokeWidth={1.4} />}
                label="Bookings"
                value={bookingCount}
                accent={liveEvent ? "signal" : undefined}
            />
        </section>
    );
};

const formatFreeDuration = (minutes: number) =>
    formatDuration(intervalToDuration({ start: 0, end: minutes * 60_000 }), { format: ["hours", "minutes"] }) ||
    "0 minutes";

const RoomBookingStat = ({
    icon,
    label,
    value,
    accent,
}: {
    icon: ReactNode;
    label: string;
    value: number | string;
    accent?: "signal";
}) => (
    <div className="flex gap-3 border-y border-(--hairline) py-4">
        <div className="flex size-9 shrink-0 items-center justify-center border border-(--hairline) text-(--gold)">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="eyebrow">{label}</p>
            <p
                className={cn(
                    "mt-1 truncate text-sm font-semibold",
                    accent === "signal" ? "text-(--signal)" : "text-(--bone)",
                )}
            >
                {value}
            </p>
        </div>
    </div>
);
