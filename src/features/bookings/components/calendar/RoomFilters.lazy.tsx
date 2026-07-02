import { lazy } from "react";

import { cn } from "@/lib/utils";

export const LazyRoomFilters = lazy(() =>
    import("@/features/bookings/components/calendar/RoomFilters").then((m) => ({
        default: m.RoomFilters,
    })),
);

export const RoomFiltersFallback = () => (
    <>
        <div aria-hidden className="flex-1 animate-pulse space-y-6 overflow-y-auto p-8">
            <Group widths={["w-12", "w-10", "w-10", "w-10", "w-12", "w-12"]} />
            <Group widths={["w-20", "w-16", "w-24", "w-16"]} />
            <Group widths={["w-16", "w-24", "w-20"]} />
        </div>
        <div className="flex items-center gap-3 border-t border-(--hairline) px-8 py-5">
            <Bar className="h-9 w-16" />
            <Bar className="h-10 flex-1" />
        </div>
    </>
);

const Bar = ({ className }: { className?: string }) => (
    <div className={cn("rounded-none bg-(--surface-02)", className)} />
);

const Group = ({ widths }: { widths: string[] }) => (
    <div className="space-y-4 border-t border-(--hairline) pt-6 first:border-t-0 first:pt-0">
        <Bar className="h-2.5 w-28" />
        <div className="flex flex-wrap gap-2">
            {widths.map((width, index) => (
                <Bar key={index} className={cn("h-7", width)} />
            ))}
        </div>
    </div>
);
