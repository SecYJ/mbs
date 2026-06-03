import { useEffect, useRef, type ComponentProps } from "react";
import { Link } from "@tanstack/react-router";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { addMinutes, startOfDay } from "date-fns";

import { useBookingAvailabilityCalendar } from "@/features/bookings/hooks/useBookingAvailabilityCalendar";
import { useBookingCalendarStore } from "@/features/bookings/stores/booking-calendar-store";
import { bookingCalendarViewMap, isPastCalendarEvent } from "@/features/bookings/utils/booking-calendar";

type SlotClickArg = {
    date: Date;
    resourceId?: string;
};

const slotMinMinutes = 7 * 60;
const slotMaxMinutes = 24 * 60;
const slotDurationMinutes = 30;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const BookingAvailabilityCalendar = ({
    onEventClick,
    onDateClick,
    onSelect,
}: {
    onDateClick: (arg: SlotClickArg) => void;
    onEventClick: (arg: EventClickArg) => void;
    onSelect: (arg: DateSelectArg) => void;
}) => {
    const { events, resources, view } = useBookingAvailabilityCalendar();
    const visibleRange = useBookingCalendarStore((state) => state.visibleRange);
    const { setCalendar, setVisibleRange } = useBookingCalendarStore((state) => state.actions);
    const calendarRootRef = useRef<HTMLDivElement>(null);

    const handleDateClick: NonNullable<ComponentProps<typeof FullCalendar>["dateClick"]> = (info) => {
        onDateClick({
            date: info.date,
            resourceId: info.resource?.id,
        });
    };

    useEffect(() => {
        const root = calendarRootRef.current;
        if (!root) return;

        const handleGridClick = (event: MouseEvent) => {
            if (view !== "day" || !visibleRange || resources.length === 0) return;

            const target = event.target;
            if (!(target instanceof HTMLElement) || target.closest(".fc-event")) return;

            const slotsElement = root.querySelector<HTMLElement>(".fc-timegrid-slots");
            const columnElements = Array.from(root.querySelectorAll<HTMLElement>(".fc-timegrid-col")).slice(
                -resources.length,
            );

            if (!slotsElement || columnElements.length === 0) return;

            const columnIndex = columnElements.findIndex((column) => {
                const rect = column.getBoundingClientRect();
                return event.clientX >= rect.left && event.clientX <= rect.right;
            });

            if (columnIndex === -1) return;

            const slotsRect = slotsElement.getBoundingClientRect();
            if (event.clientY < slotsRect.top || event.clientY > slotsRect.bottom) return;

            const minutesRange = slotMaxMinutes - slotMinMinutes;
            const clickRatio = clamp((event.clientY - slotsRect.top) / slotsRect.height, 0, 1);
            const clickedMinutes = Math.floor((clickRatio * minutesRange) / slotDurationMinutes) * slotDurationMinutes;

            onDateClick({
                date: addMinutes(startOfDay(visibleRange.activeStart), slotMinMinutes + clickedMinutes),
                resourceId: resources[columnIndex]?.id,
            });
        };

        root.addEventListener("click", handleGridClick);

        return () => root.removeEventListener("click", handleGridClick);
    }, [onDateClick, resources, view, visibleRange]);

    return (
        <div
            ref={calendarRootRef}
            className="fc-dark-theme border-y border-(--hairline) py-2"
            style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 400ms both" }}
        >
            <FullCalendar
                ref={setCalendar}
                plugins={[resourceTimeGridPlugin, timeGridPlugin, dayGridPlugin, multiMonthPlugin, interactionPlugin]}
                initialView={bookingCalendarViewMap[view]}
                resources={resources}
                events={events}
                headerToolbar={false}
                height="auto"
                firstDay={1}
                slotMinTime="07:00:00"
                slotMaxTime="24:00:00"
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                allDaySlot={false}
                selectable
                selectMirror
                selectAllow={(info) => info.start.getTime() > Date.now()}
                editable={false}
                nowIndicator
                expandRows
                dayMaxEvents={4}
                slotLabelFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }}
                views={{
                    dayGridMonth: { dayHeaderFormat: { weekday: "short" } },
                    timeGridWeek: { dayHeaderFormat: { weekday: "short", day: "numeric" } },
                    multiMonthYear: { multiMonthMaxColumns: 3, multiMonthMinWidth: 200 },
                }}
                multiMonthMaxColumns={3}
                multiMonthMinWidth={200}
                resourceLabelContent={(arg) => (
                    <Link
                        to="/rooms/$roomId"
                        params={{ roomId: arg.resource.id }}
                        className="flex items-center gap-3 py-2 no-underline"
                    >
                        <div className="flex flex-col gap-0.5 text-left">
                            <span className="text-[0.82rem] font-medium tracking-[0.02em] text-(--bone)">
                                {arg.resource.title}
                            </span>
                            <span className="tabular-num text-[0.6rem] text-(--bone-dim)">
                                {arg.resource.extendedProps.location} &middot; {arg.resource.extendedProps.capacity}p
                            </span>
                        </div>
                    </Link>
                )}
                eventContent={(arg) => (
                    <div className="flex h-full flex-col justify-center overflow-hidden px-2 py-1">
                        <span className="truncate text-[0.74rem] leading-tight font-medium text-(--bone)">
                            {arg.event.title}
                        </span>
                        <span className="tabular-num truncate text-[0.6rem] leading-tight text-(--bone-dim)">
                            {arg.timeText}
                        </span>
                    </div>
                )}
                eventClassNames={(info) =>
                    isPastCalendarEvent(info.event.toPlainObject()) ? ["booking-event-past"] : []
                }
                eventDidMount={(info) => {
                    if (isPastCalendarEvent(info.event.toPlainObject())) {
                        info.el.setAttribute("aria-disabled", "true");
                        info.el.setAttribute("title", "Past booking");
                    }
                }}
                datesSet={setVisibleRange}
                dateClick={handleDateClick}
                select={onSelect}
                eventClick={onEventClick}
            />
        </div>
    );
};
