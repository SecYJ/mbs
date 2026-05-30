import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Plus } from "lucide-react";
import { isPast } from "date-fns";

import { BookingCalendarAvailability } from "@/features/bookings/components/booking-calendar-availability";
import { BookingCalendarControls } from "@/features/bookings/components/booking-calendar-controls";
import { BookingCalendarSummary } from "@/features/bookings/components/booking-calendar-summary";
import { BookingReservationEditor } from "@/features/bookings/components/booking-reservation-editor";
import type { BookingReservationEditorControls } from "@/features/bookings/components/booking-reservation-editor.types";
import { useBookingCalendarModel } from "@/features/bookings/hooks/useBookingCalendarModel";
import { BookingCalendarStoreProvider } from "@/features/bookings/stores/booking-calendar-store";
import { getBookingEventInput, isPastCalendarEvent } from "@/features/bookings/utils/booking-calendar.utils";
import { cn } from "@/lib/utils";

export const BookingCalendarPage = () => (
    <BookingCalendarStoreProvider>
        <BookingReservationEditor>
            {(reservationEditor) => <BookingCalendarPageContent {...reservationEditor} />}
        </BookingReservationEditor>
    </BookingCalendarStoreProvider>
);

const BookingCalendarPageContent = ({
    openExistingReservation,
    openNewReservation,
}: BookingReservationEditorControls) => {
    const {
        accentByRoomId,
        data,
        filteredRooms,
        hasRooms,
        resources,
        showCalendar,
        showFilterZeroState,
        view,
        visibleEvents,
    } = useBookingCalendarModel();

    const handleSelect = (info: DateSelectArg) => {
        if (isPast(info.start)) {
            return;
        }

        openNewReservation({
            roomId: info.resource?.id,
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

        const booking = data.events.find((event) => event.id === info.event.id);
        if (!booking) return;

        openExistingReservation(getBookingEventInput(booking));
    };

    return (
        <div className="space-y-6">
            <header
                className="relative border-b border-(--hairline) pb-5"
                style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}
            >
                <div className="grid gap-5 xl:grid-cols-[minmax(240px,0.9fr)_minmax(460px,1.35fr)_auto] xl:items-center">
                    <div>
                        <p className="eyebrow eyebrow-gold">Concierge &middot; Today</p>
                        <h1 className="mt-2 display-italic text-[clamp(2rem,3vw,2.8rem)] leading-none tracking-[-0.02em] text-(--bone)">
                            Room Bookings
                        </h1>
                    </div>

                    <BookingCalendarSummary />

                    <button
                        type="button"
                        onClick={() => openNewReservation()}
                        disabled={!hasRooms}
                        className={cn(
                            "group relative flex h-11 items-center justify-center gap-3 self-start border border-(--bone) bg-(--bone) px-6 text-[0.68rem] font-semibold tracking-[0.3em] text-black uppercase transition-all duration-300 xl:self-center",
                            hasRooms
                                ? "cursor-pointer hover:border-white hover:bg-white hover:tracking-[0.34em]"
                                : "cursor-not-allowed opacity-45",
                        )}
                    >
                        <Plus
                            className="size-4 transition-transform duration-300 group-hover:rotate-90"
                            strokeWidth={1.8}
                        />
                        <span>New Booking</span>
                    </button>
                </div>
            </header>

            <BookingCalendarControls />

            <BookingCalendarAvailability
                accentByRoomId={accentByRoomId}
                currentUserRole={data.currentUserRole}
                events={visibleEvents}
                filteredRooms={filteredRooms}
                onEventClick={handleEventClick}
                onSelect={handleSelect}
                resources={resources}
                showCalendar={showCalendar}
                showFilterZeroState={showFilterZeroState}
                showNoRoomsState={!hasRooms}
                view={view}
            />
        </div>
    );
};
