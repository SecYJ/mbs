import { useSuspenseQuery } from "@tanstack/react-query";
import { Building2, CalendarDays, TrendingUp } from "lucide-react";

import { adminStatCardClasses } from "@/features/admin/admin-classes";
import { adminBookingQueries } from "@/features/admin/services/bookings/queries";

export const AdminBookingStats = () => {
    const {
        data: { popularRoom, todayCount, weekCount },
    } = useSuspenseQuery(adminBookingQueries.stats());

    return (
        <div className="mb-6 grid grid-cols-3 gap-4">
            <div className={adminStatCardClasses}>
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg border border-(--a-accent-border) bg-(--a-accent-subtle)">
                        <CalendarDays className="size-4 text-(--a-accent)" strokeWidth={1.6} />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-(--a-text) tabular-nums">{todayCount}</p>
                        <p className="text-[0.6875rem] font-medium text-(--a-text-muted)">Today's bookings</p>
                    </div>
                </div>
            </div>

            <div className={adminStatCardClasses}>
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg border border-[rgba(83,155,245,0.2)] bg-(--a-info-subtle)">
                        <TrendingUp className="size-4 text-(--a-info)" strokeWidth={1.6} />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-(--a-text) tabular-nums">{weekCount}</p>
                        <p className="text-[0.6875rem] font-medium text-(--a-text-muted)">This week</p>
                    </div>
                </div>
            </div>

            <div className={adminStatCardClasses}>
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg border border-[rgba(52,211,153,0.2)] bg-(--a-success-subtle)">
                        <Building2 className="size-4 text-(--a-success)" strokeWidth={1.6} />
                    </div>
                    <div>
                        <p className="truncate text-sm font-bold text-(--a-text)">{popularRoom ?? "-"}</p>
                        <p className="text-[0.6875rem] font-medium text-(--a-text-muted)">Most popular room</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
