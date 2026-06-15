import type { ComponentProps } from "react";
import { Link } from "@tanstack/react-router";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import { compareAsc } from "date-fns";
import { z } from "zod";

import { useBookingAvailabilityCalendar } from "@/features/bookings/hooks/useBookingAvailabilityCalendar";
import { bookingCalendarViewMap } from "@/features/bookings/schemas/booking-calendar-search.schema";
import { useBookingCalendarStore } from "@/features/bookings/stores/booking-calendar-store";

const eventEndDateSchema = z
    .preprocess((value) => (value ? value : undefined), z.coerce.date().optional())
    .transform((date) => date ?? null)
    .catch(null);

export const isPastCalendarEvent = (event: EventInput, now = new Date()) => {
    const end = eventEndDateSchema.parse(event.end);
    return !!end && compareAsc(end, now) <= 0;
};

type SlotClickArg = {
    date: Date;
    resourceId?: string;
};

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
    const { setCalendar, setVisibleRange } = useBookingCalendarStore((state) => state.actions);

    const handleDateClick: NonNullable<ComponentProps<typeof FullCalendar>["dateClick"]> = (info) => {
        onDateClick({
            date: info.date,
            resourceId: info.resource?.id,
        });
    };

    return (
        <div
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
