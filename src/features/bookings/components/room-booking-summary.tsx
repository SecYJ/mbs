import type { ReactNode } from "react";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

import type { BookingCalendarData } from "@/features/bookings/services/queries";
import type { BookingCalendarEvent } from "@/features/bookings/utils/booking-calendar.utils";
import { formatMinuteDuration } from "@/features/bookings/utils/room-booking-day.utils";

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
    <div className="flex gap-3 border-y border-[var(--hairline)] py-4">
        <div className="flex size-9 shrink-0 items-center justify-center border border-[var(--hairline)] text-[var(--gold)]">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="eyebrow">{label}</p>
            <p
                className={`mt-1 truncate text-sm font-semibold ${
                    accent === "signal" ? "text-[var(--signal)]" : "text-[var(--bone)]"
                }`}
            >
                {value}
            </p>
        </div>
    </div>
);

export const RoomBookingSummary = ({
    bookingCount,
    freeMinutes,
    liveEvent,
    room,
}: {
    bookingCount: number;
    freeMinutes: number;
    liveEvent: BookingCalendarEvent | undefined;
    room: BookingCalendarData["rooms"][number];
}) => (
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
            value={formatMinuteDuration(freeMinutes)}
        />
        <RoomBookingStat
            icon={<CalendarDays className="size-4" strokeWidth={1.4} />}
            label="Bookings"
            value={bookingCount}
            accent={liveEvent ? "signal" : undefined}
        />
    </section>
);
