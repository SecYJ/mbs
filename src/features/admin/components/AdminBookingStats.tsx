import { Building2, CalendarDays, TrendingUp } from "lucide-react";

import { adminStatCardClasses } from "@/features/admin/admin-classes";
import { adminBookingStatsQueryOptions } from "@/features/admin/services/bookings/queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export const AdminBookingStats = () => {
    const {
        data: { popularRoom, todayCount, weekCount },
    } = useSuspenseQuery(adminBookingStatsQueryOptions());

    return (
        <div className="mb-6 grid grid-cols-3 gap-4">
            <div className={adminStatCardClasses}>
                <div className="flex items-center gap-3">
                    <div
                        className="flex size-9 items-center justify-center rounded-lg"
                        style={{
                            background: "var(--a-accent-subtle)",
                            border: "1px solid var(--a-accent-border)",
                        }}
                    >
                        <CalendarDays className="size-4" style={{ color: "var(--a-accent)" }} strokeWidth={1.6} />
                    </div>
                    <div>
                        <p className="tabular-nums text-xl font-bold" style={{ color: "var(--a-text)" }}>
                            {todayCount}
                        </p>
                        <p className="text-[0.6875rem] font-medium" style={{ color: "var(--a-text-muted)" }}>
                            Today's bookings
                        </p>
                    </div>
                </div>
            </div>

            <div className={adminStatCardClasses}>
                <div className="flex items-center gap-3">
                    <div
                        className="flex size-9 items-center justify-center rounded-lg"
                        style={{
                            background: "var(--a-info-subtle)",
                            border: "1px solid rgba(83,155,245,0.2)",
                        }}
                    >
                        <TrendingUp className="size-4" style={{ color: "var(--a-info)" }} strokeWidth={1.6} />
                    </div>
                    <div>
                        <p className="tabular-nums text-xl font-bold" style={{ color: "var(--a-text)" }}>
                            {weekCount}
                        </p>
                        <p className="text-[0.6875rem] font-medium" style={{ color: "var(--a-text-muted)" }}>
                            This week
                        </p>
                    </div>
                </div>
            </div>

            <div className={adminStatCardClasses}>
                <div className="flex items-center gap-3">
                    <div
                        className="flex size-9 items-center justify-center rounded-lg"
                        style={{
                            background: "var(--a-success-subtle)",
                            border: "1px solid rgba(52,211,153,0.2)",
                        }}
                    >
                        <Building2 className="size-4" style={{ color: "var(--a-success)" }} strokeWidth={1.6} />
                    </div>
                    <div>
                        <p className="truncate text-sm font-bold" style={{ color: "var(--a-text)" }}>
                            {popularRoom ?? "-"}
                        </p>
                        <p className="text-[0.6875rem] font-medium" style={{ color: "var(--a-text-muted)" }}>
                            Most popular room
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
