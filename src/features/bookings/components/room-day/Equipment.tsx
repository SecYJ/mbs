import { Monitor } from "lucide-react";

import type { BookingCalendarData } from "@/features/bookings/services/queries";

export const Equipment = ({ room }: { room: BookingCalendarData["rooms"][number] }) => (
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
    </aside>
);
