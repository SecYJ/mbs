import dayGridPlugin from "@fullcalendar/daygrid";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { addMinutes, isPast } from "date-fns";
import { useDeferredValue } from "react";

import { useBookingCalendarEventsContext } from "@/features/bookings/contexts/BookingCalendarEventsContext";
import { bookingCalendarViewMap } from "@/features/bookings/schemas/booking-calendar-search.schema";
import { bookingCalendarQueries, type BookingCalendarEvent } from "@/features/bookings/services/queries";
import { useBookingCalendarStore } from "@/features/bookings/stores/BookingCalendarStore";
import { isPastCalendarEvent } from "@/features/bookings/utils/calendar-event";

export const AvailabilityCalendar = () => {
    const search = useSearch({ from: "/_bookings/bookings" });
    const deferredSearch = useDeferredValue(search);
    const events = useBookingCalendarEventsContext();

    const { data: resources } = useSuspenseQuery({
        ...bookingCalendarQueries.rooms(deferredSearch),
        select: (data) => {
            return data.rooms.map((room) => ({
                id: room.id,
                title: room.title,
                extendedProps: {
                    location: room.location,
                    capacity: room.capacity,
                    equipment: room.equipment,
                },
            }));
        },
    });

    const { openExistingReservation, openNewReservation, setCalendar, setVisibleRange } = useBookingCalendarStore(
        (state) => state.actions,
    );

    const handleDateClick = (info: DateClickArg) => {
        if (isPast(info.date)) {
            return;
        }

        if (!info.resource?.id) {
            openNewReservation();
            return;
        }

        openNewReservation({
            roomId: info.resource.id,
            start: info.date,
            end: addMinutes(info.date, 30),
        });
    };

    const handleSelect = (info: DateSelectArg) => {
        if (isPast(info.start)) {
            return;
        }

        if (!info.resource?.id) {
            openNewReservation();
            return;
        }

        openNewReservation({
            roomId: info.resource.id,
            start: info.start,
            end: info.end,
        });
    };

    const handleEventClick = (info: EventClickArg) => {
        if (isPastCalendarEvent(info.event.toPlainObject())) {
            info.jsEvent.preventDefault();
            info.jsEvent.stopPropagation();
            return;
        }

        openExistingReservation(info.event.toPlainObject() as BookingCalendarEvent);
    };

    return (
        <div className="fc-dark-theme border-y border-(--hairline) py-2 animate-fade-up animation-duration-700 [animation-delay:400ms]">
            <FullCalendar
                ref={setCalendar}
                plugins={[resourceTimeGridPlugin, timeGridPlugin, dayGridPlugin, multiMonthPlugin, interactionPlugin]}
                initialView={bookingCalendarViewMap[search.view]}
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
                select={handleSelect}
                eventClick={handleEventClick}
            />
        </div>
    );
};
