import { format } from "date-fns";

type RoomBookingNextOpeningProps = {
    bookableSlot: { start: Date; end: Date } | null;
};

export const RoomBookingNextOpening = ({ bookableSlot }: RoomBookingNextOpeningProps) => (
    <section className="border-y border-(--hairline) py-5">
        <p className="eyebrow text-(--gold)">Next Opening</p>
        {bookableSlot ? (
            <div className="mt-4 border border-(--hairline) bg-(--surface-01) p-4">
                <span className="block text-sm font-semibold text-(--bone)">
                    {format(bookableSlot.start, "EEE, MMM d")}
                </span>
                <span className="tabular-num mt-2 block text-xl text-(--gold)">
                    {format(bookableSlot.start, "HH:mm")} - {format(bookableSlot.end, "HH:mm")}
                </span>
                <span className="mt-2 block text-xs leading-5 text-(--bone-muted)">
                    Next available reservation window.
                </span>
            </div>
        ) : (
            <p className="mt-4 text-sm leading-6 text-(--bone-muted)">There are no future free slots on this day.</p>
        )}
    </section>
);
