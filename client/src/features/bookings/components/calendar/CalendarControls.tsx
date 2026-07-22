import { useIsFetching, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import { format, isWithinInterval, subMilliseconds } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useShallow } from "zustand/shallow";

import { RoomFiltersControl } from "@/features/bookings/components/calendar/RoomFiltersControl";
import {
    bookingCalendarViewMap,
    bookingCalendarViews,
} from "@/features/bookings/schemas/booking-calendar-search.schema";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";
import { useBookingCalendarStore } from "@/features/bookings/stores/BookingCalendarStore";
import { cn } from "@/lib/utils";

export const CalendarControlRenderer = () => {
    const { data: rooms } = useSuspenseQuery({
        ...bookingCalendarQueries.data(),
        select: (data) => data.rooms,
    });

    return rooms.length > 0 ? <CalendarControls /> : null;
};

const Route = getRouteApi("/_bookings/bookings");
const CalendarControls = () => {
    const search = Route.useSearch();
    const { view } = search;
    const now = new Date();

    const isPreparingCalendarRange =
        useIsFetching({
            queryKey: bookingCalendarQueries.eventsKey(),
        }) > 0;

    const { calendar, viewContainsToday, todayButtonLabel } = useBookingCalendarStore(
        useShallow(({ calendar: calendarInstance, visibleRange }) => {
            const isTodayVisible = visibleRange
                ? isWithinInterval(now, {
                      start: visibleRange.activeStart,
                      end: subMilliseconds(visibleRange.activeEnd, 1),
                  })
                : true;

            const buttonLabel = isTodayVisible
                ? `Today · ${format(now, "EEEE, MMMM d, yyyy")}`
                : (visibleRange?.title ?? format(now, "MMMM yyyy"));

            return {
                calendar: calendarInstance,
                viewContainsToday: isTodayVisible,
                todayButtonLabel: buttonLabel,
            };
        }),
    );

    const goToCalendarDate = (direction: "next" | "prev") => {
        const api = calendar?.getApi();
        if (!api) return;

        if (direction === "next") {
            api.next();
            return;
        }

        api.prev();
    };

    const goToday = () => {
        const api = calendar?.getApi();
        if (!api) return;

        api.today();
    };

    const goToCalendarView = (viewKey: (typeof bookingCalendarViews)[number]) => {
        const api = calendar?.getApi();

        api?.changeView(bookingCalendarViewMap[viewKey]);
    };

    return (
        <div className="animate-fade-up animation-duration-700 gap-y-5 [animation-delay:200ms] lg:flex lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => goToCalendarDate("prev")}
                        disabled={!calendar}
                        aria-label="Previous"
                        className="flex size-9 cursor-pointer items-center justify-center border border-(--hairline) text-(--bone-dim) transition-all hover:border-(--hairline-strong) hover:text-(--bone)"
                    >
                        <ChevronLeft className="size-4" strokeWidth={1.4} />
                    </button>
                    <button
                        type="button"
                        onClick={() => goToCalendarDate("next")}
                        disabled={!calendar}
                        aria-label="Next"
                        className="flex size-9 cursor-pointer items-center justify-center border border-(--hairline) text-(--bone-dim) transition-all hover:border-(--hairline-strong) hover:text-(--bone)"
                    >
                        <ChevronRight className="size-4" strokeWidth={1.4} />
                    </button>
                </div>
                <button
                    type="button"
                    onClick={goToday}
                    disabled={isPreparingCalendarRange || !calendar}
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
                            to="/bookings"
                            search={(prev) => ({ ...prev, view: viewKey })}
                            onClick={() => goToCalendarView(viewKey)}
                            disabled={!calendar}
                            aria-pressed={view === viewKey}
                            className="relative cursor-pointer px-4 py-1 text-[0.66rem] font-semibold tracking-[0.28em] text-(--bone-dim) uppercase transition-colors hover:text-(--bone-muted) disabled:cursor-default"
                            activeProps={{
                                className: "text-(--bone)",
                            }}
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

                <RoomFiltersControl />
            </div>
        </div>
    );
};
