import { format } from "date-fns";
import { Monitor } from "lucide-react";

import type { BookingCalendarData } from "@/features/bookings/services/queries";

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
        <section className="border-y border-(--hairline) py-5">
            <p className="eyebrow text-(--gold)">Equipment</p>
            {room.equipment.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-(--bone-muted)">No equipment is assigned to this room yet.</p>
            ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                    {room.equipment.map((item) => (
                        <span
                            key={item}
                            className="inline-flex items-center gap-2 border border-(--hairline) bg-(--surface-01) px-3 py-1.5 text-xs text-(--bone-muted)"
                        >
                            <Monitor className="size-3.5 text-(--gold)" strokeWidth={1.4} />
                            <span>{item}</span>
                        </span>
                    ))}
                </div>
            )}
        </section>

        <section className="border-y border-(--hairline) py-5">
            <p className="eyebrow text-(--gold)">Next Opening</p>
            {bookableSlot ? (
                <button
                    type="button"
                    onClick={() => onBook(bookableSlot)}
                    className="mt-4 block w-full cursor-pointer border border-(--hairline) bg-(--surface-01) p-4 text-left transition-colors hover:border-(--hairline-strong) hover:bg-(--surface-02)"
                >
                    <span className="block text-sm font-semibold text-(--bone)">
                        {format(bookableSlot.start, "EEE, MMM d")}
                    </span>
                    <span className="tabular-num mt-2 block text-xl text-(--gold)">
                        {format(bookableSlot.start, "HH:mm")} - {format(bookableSlot.end, "HH:mm")}
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-(--bone-muted)">
                        Next available reservation window.
                    </span>
                </button>
            ) : (
                <p className="mt-4 text-sm leading-6 text-(--bone-muted)">
                    There are no future free slots on this day.
                </p>
            )}
        </section>
    </aside>
);
