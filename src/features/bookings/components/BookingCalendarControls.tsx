import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { BookingRoomFilters } from "@/features/bookings/components/BookingRoomFilters";
import { useBookingCalendarControls } from "@/features/bookings/hooks/useBookingCalendarControls";
import { useBookingCalendarStore } from "@/features/bookings/stores/BookingCalendarStore";
import {
    bookingCalendarViewMap,
    bookingCalendarViews,
} from "@/features/bookings/schemas/booking-calendar-search.schema";
import { cn } from "@/lib/utils";

export const BookingCalendarControls = () => {
    const { todayButtonLabel, view, viewContainsToday } = useBookingCalendarControls();
    const { changeView, goNext, goPrev, goToday } = useBookingCalendarStore((state) => state.actions);

    return (
        <div
            className="gap-y-5 lg:flex lg:items-center lg:justify-between lg:space-y-0"
            style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 200ms both" }}
        >
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={goPrev}
                        aria-label="Previous"
                        className="flex size-9 cursor-pointer items-center justify-center border border-(--hairline) text-(--bone-dim) transition-all hover:border-(--hairline-strong) hover:text-(--bone)"
                    >
                        <ChevronLeft className="size-4" strokeWidth={1.4} />
                    </button>
                    <button
                        type="button"
                        onClick={goNext}
                        aria-label="Next"
                        className="flex size-9 cursor-pointer items-center justify-center border border-(--hairline) text-(--bone-dim) transition-all hover:border-(--hairline-strong) hover:text-(--bone)"
                    >
                        <ChevronRight className="size-4" strokeWidth={1.4} />
                    </button>
                </div>
                <button
                    type="button"
                    onClick={goToday}
                    aria-label="Go to today"
                    title="Go to today"
                    className={cn(
                        "text-[0.66rem] font-semibold tracking-[0.28em] uppercase transition-colors",
                        viewContainsToday ? "text-(--gold)" : "cursor-pointer text-(--bone-dim) hover:text-(--bone)",
                    )}
                >
                    {todayButtonLabel}
                </button>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-stretch divide-x divide-(--hairline)">
                    {bookingCalendarViews.map((viewKey) => (
                        <Link
                            key={viewKey}
                            from="/bookings"
                            to="."
                            search={(prev) => ({ ...prev, view: viewKey })}
                            onClick={() => changeView(bookingCalendarViewMap[viewKey])}
                            className={cn(
                                "relative px-4 py-1 text-[0.66rem] font-semibold tracking-[0.28em] uppercase no-underline transition-colors",
                                view === viewKey ? "text-(--bone)" : "text-(--bone-dim) hover:text-(--bone-muted)",
                            )}
                        >
                            {viewKey}
                            <span
                                className={cn(
                                    "pointer-events-none absolute right-2 bottom-0 left-2 h-px transition-all duration-300",
                                    view === viewKey ? "bg-(--gold)" : "bg-transparent",
                                )}
                            />
                        </Link>
                    ))}
                </div>

                <BookingRoomFilters />
            </div>
        </div>
    );
};
