import { Monitor } from "lucide-react";

import type { BookingCalendarData } from "@/features/bookings/services/queries";
import { formatShortDate, formatTime } from "@/features/bookings/utils/room-booking-day.utils";

export const RoomBookingEquipment = ({
    bookableSlot,
    onBook,
    room,
}: {
    bookableSlot: { start: Date; end: Date } | null;
    onBook: (slot: { start: Date; end: Date }) => void;
    room: BookingCalendarData["rooms"][number];
}) => (
    <aside className="space-y-7">
        <section className="border-y border-[var(--hairline)] py-5">
            <p className="eyebrow eyebrow-gold">Equipment</p>
            {room.equipment.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-[var(--bone-muted)]">
                    No equipment is assigned to this room yet.
                </p>
            ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                    {room.equipment.map((item) => (
                        <span
                            key={item}
                            className="inline-flex items-center gap-2 border border-[var(--hairline)] bg-[var(--surface-01)] px-3 py-1.5 text-xs text-[var(--bone-muted)]"
                        >
                            <Monitor className="size-3.5 text-[var(--gold)]" strokeWidth={1.4} />
                            <span>{item}</span>
                        </span>
                    ))}
                </div>
            )}
        </section>

        <section className="border-y border-[var(--hairline)] py-5">
            <p className="eyebrow eyebrow-gold">Next Opening</p>
            {bookableSlot ? (
                <button
                    type="button"
                    onClick={() => onBook(bookableSlot)}
                    className="mt-4 block w-full cursor-pointer border border-[var(--hairline)] bg-[var(--surface-01)] p-4 text-left transition-colors hover:border-[var(--hairline-strong)] hover:bg-[var(--surface-02)]"
                >
                    <span className="block text-sm font-semibold text-[var(--bone)]">
                        {formatShortDate(bookableSlot.start)}
                    </span>
                    <span className="tabular-num mt-2 block text-xl text-[var(--gold)]">
                        {formatTime(bookableSlot.start)} - {formatTime(bookableSlot.end)}
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-[var(--bone-muted)]">
                        Next available reservation window.
                    </span>
                </button>
            ) : (
                <p className="mt-4 text-sm leading-6 text-[var(--bone-muted)]">
                    There are no future free slots on this day.
                </p>
            )}
        </section>
    </aside>
);
