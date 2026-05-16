import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { BookingHistoryList } from "@/features/bookings/booking-history-list";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";

const HistoryPage = () => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            <header className="flex flex-col gap-5 border-b border-(--hairline) pb-7 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="eyebrow eyebrow-gold">History</p>
                    <h1 className="display-serif mt-3 text-4xl leading-none text-(--bone) md:text-5xl">History</h1>
                </div>
                <div className="min-w-24 border border-(--hairline) px-4 py-3 text-center">
                    <p className="eyebrow">Total</p>
                    <p className="mt-1 text-xl font-semibold text-(--bone)">{data.history.length}</p>
                </div>
            </header>

            <BookingHistoryList bookings={data.history} />
        </div>
    );
};

export const Route = createFileRoute("/_bookings/history")({
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(bookingCalendarQueryOptions()),
    component: HistoryPage,
});
