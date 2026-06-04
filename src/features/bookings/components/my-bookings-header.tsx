import { useSuspenseQuery } from "@tanstack/react-query";

import { myBookingsStatsQueryOptions } from "@/features/bookings/services/queries";
import { cn } from "@/lib/utils";

export const MyBookingsHeader = () => {
    const { data } = useSuspenseQuery(myBookingsStatsQueryOptions());

    return (
        <header className="grid gap-6 border-b border-(--hairline) pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
                <p className="eyebrow text-(--gold)">BOOKINGS &middot; PERSONAL LEDGER</p>
                <h1 className="display-italic mt-3 text-4xl leading-none font-normal text-(--bone) md:text-5xl">
                    My Bookings
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-(--bone-muted)">
                    Meetings you organize or attend, grouped by what needs attention now.
                </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-(--hairline) border-y border-(--hairline) py-3">
                <Stat label="Active" value={data.activeCount} accent={data.activeCount > 0 ? "signal" : undefined} />
                <Stat label="Owned" value={data.ownedCount} />
                <Stat label="Invited" value={data.attendingCount} />
            </div>
        </header>
    );
};

const Stat = ({ label, value, accent }: { label: string; value: number; accent?: "signal" }) => (
    <div className="min-w-24 px-4 text-center">
        <p className="eyebrow">{label}</p>
        <p
            className={cn("tabular-num mt-1 text-xl font-semibold", {
                "text-(--signal)": accent === "signal",
                "text-(--bone)": accent !== "signal",
            })}
        >
            {value}
        </p>
    </div>
);
