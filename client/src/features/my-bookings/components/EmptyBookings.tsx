import { CalendarDays } from "lucide-react";

export const EmptyBookings = ({ hasQuery }: { hasQuery: boolean }) => (
    <section className="flex min-h-80 flex-col items-center justify-center border border-dashed border-(--hairline) px-6 text-center">
        <CalendarDays className="size-8 text-(--bone-dim)" strokeWidth={1.4} />
        <h2 className="mt-5 text-lg font-semibold text-(--bone)">
            {hasQuery ? "No matching bookings" : "No bookings yet"}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-(--bone-muted)">
            {hasQuery
                ? "Adjust the search or group filter to widen the ledger."
                : "Bookings you organize or attend will collect here once the calendar starts moving."}
        </p>
    </section>
);
