import { lazy } from "react";

import { cn } from "@/lib/utils";

export const LazyAttendeePickerContent = lazy(() =>
    import("@/features/bookings/components/reservation/AttendeePickerContent").then((m) => ({
        default: m.AttendeePickerContent,
    })),
);

const Bar = ({ className }: { className?: string }) => (
    <div className={cn("rounded-none bg-(--surface-02)", className)} />
);

export const AttendeePickerContentFallback = () => (
    <div aria-hidden className="animate-pulse">
        <div className="mt-4 space-y-4 border-t border-(--hairline) pt-6">
            <Bar className="h-10 w-full" />
            <Bar className="h-10 w-full" />
            <Bar className="h-[min(420px,50dvh)] w-full" />
        </div>

        <div className="mt-2 flex gap-3 border-t border-(--hairline) pt-5">
            <Bar className="h-10 flex-1" />
            <Bar className="h-10 flex-1" />
        </div>
    </div>
);
