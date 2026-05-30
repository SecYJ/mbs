import { Link } from "@tanstack/react-router";

import type { BookingCalendarData } from "@/features/bookings/services/queries";
import type { RoomAccent } from "@/features/bookings/utils/booking-calendar.utils";

export const BookingRoomList = ({
    accentByRoomId,
    rooms,
}: {
    accentByRoomId: Record<string, RoomAccent>;
    rooms: BookingCalendarData["rooms"];
}) => (
    <div
        className="flex flex-wrap items-center gap-3"
        style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 300ms both" }}
    >
        <span className="eyebrow">
            {rooms.length} room{rooms.length !== 1 ? "s" : ""}
        </span>
        <div aria-hidden className="h-3 w-px bg-[var(--hairline)]" />
        {rooms.map((room) => {
            const accent = accentByRoomId[room.id];
            return (
                <Link
                    key={room.id}
                    to="/rooms/$roomId"
                    params={{ roomId: room.id }}
                    className="group relative flex items-center gap-3 border border-[var(--hairline)] bg-[var(--surface-01)] px-3 py-1.5 no-underline transition-colors hover:border-[var(--hairline-strong)]"
                >
                    {accent && (
                        <span
                            aria-hidden
                            className="absolute top-0 bottom-0 left-0 w-[2px]"
                            style={{ background: accent.stripe }}
                        />
                    )}
                    <div className="ml-1 flex items-baseline gap-2">
                        <span className="text-[0.76rem] font-medium text-[var(--bone)]">{room.title}</span>
                        <span className="tabular-num text-[0.62rem] text-[var(--bone-dim)]">
                            {room.capacity}p &middot; {room.location}
                        </span>
                    </div>
                </Link>
            );
        })}
    </div>
);
