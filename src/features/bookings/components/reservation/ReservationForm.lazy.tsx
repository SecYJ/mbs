import { lazy } from "react";

import { cn } from "@/lib/utils";

export const LazyReservationForm = lazy(() =>
    import("@/features/bookings/components/reservation/ReservationForm").then((m) => ({
        default: m.ReservationForm,
    })),
);

const Bar = ({ className }: { className?: string }) => (
    <div className={cn("rounded-none bg-(--surface-02)", className)} />
);

const Field = () => (
    <div className="space-y-2">
        <Bar className="h-2.5 w-24" />
        <Bar className="h-10 w-full" />
    </div>
);

export const ReservationFormFallback = () => (
    <div aria-hidden className="animate-pulse">
        <div className="space-y-3">
            <Bar className="h-2.5 w-28" />
            <Bar className="h-7 w-3/5" />
            <Bar className="h-3 w-4/5" />
        </div>

        <div className="mt-4 space-y-6 border-t border-(--hairline) pt-6">
            <Field />
            <Field />

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <Bar className="col-span-2 col-start-1 row-start-1 h-2.5 w-20" />
                <Bar className="col-start-1 row-start-2 h-10" />
                <Bar className="col-span-2 col-start-3 row-start-1 h-2.5 w-20" />
                <Bar className="col-start-3 row-start-2 h-10" />
            </div>

            <Field />

            <div className="space-y-2">
                <Bar className="h-2.5 w-32" />
                <Bar className="h-20 w-full" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
                <Bar className="h-9 w-24" />
                <Bar className="h-9 w-32" />
            </div>
        </div>
    </div>
);
