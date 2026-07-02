import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";

import { ReservationEditorDialog } from "@/features/bookings/components/reservation/ReservationEditorDialog";
import { Equipment } from "@/features/bookings/components/room-day/Equipment";
import { NextOpening } from "@/features/bookings/components/room-day/NextOpening";
import { Schedule } from "@/features/bookings/components/room-day/Schedule";
import { RoomDaySummary } from "@/features/bookings/components/room-day/RoomDaySummary";
import { BookingCalendarEventsProvider } from "@/features/bookings/contexts/BookingCalendarEventsContext";
import { useRoomDayModel } from "@/features/bookings/hooks/room-day/useRoomDayModel";
import { bookingCalendarQueries, type BookingCalendarEvent } from "@/features/bookings/services/queries";
import { BookingCalendarStoreProvider, useBookingCalendarStore } from "@/features/bookings/stores/BookingCalendarStore";
import { useDeferredValue } from "react";

const Route = getRouteApi("/_bookings/rooms/$roomId");

export const RoomBookingDayPage = () => (
    <BookingCalendarStoreProvider>
        <RoomBookingDayPageContent />
    </BookingCalendarStoreProvider>
);

const RoomBookingDayPageContent = () => {
    const { roomId } = Route.useParams();
    const { date } = Route.useSearch();

    const deferredDate = useDeferredValue(date);

    const { data: calendarEvents } = useSuspenseQuery(
        bookingCalendarQueries.roomDayEvents({ roomId, date: deferredDate }),
    );

    return (
        <BookingCalendarEventsProvider events={calendarEvents}>
            <RoomBookingDayPageInner />
        </BookingCalendarEventsProvider>
    );
};

const RoomBookingDayPageInner = () => {
    const { openNewReservation, openExistingReservation } = useBookingCalendarStore((state) => state.actions);
    const { bookableSlot, goToDate, room, segments, selectedDate } = useRoomDayModel();

    if (!room) {
        return (
            <div className="mx-auto w-full max-w-4xl space-y-6">
                <Link
                    to="/bookings"
                    className="inline-flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase no-underline transition-colors hover:text-(--bone)"
                >
                    <ArrowLeft className="size-4" strokeWidth={1.4} />
                    <span>Calendar</span>
                </Link>
                <section className="border-y border-(--hairline) py-12">
                    <p className="eyebrow text-(--gold)">Room Details</p>
                    <h1 className="display-italic mt-3 text-4xl leading-none font-normal text-(--bone)">
                        Room not found
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-(--bone-muted)">
                        This room may have been removed or is no longer available in the booking system.
                    </p>
                </section>
            </div>
        );
    }

    const openReservationEditor = (slot: { start: Date; end: Date }) => {
        openNewReservation({ roomId: room.id, start: slot.start, end: slot.end });
    };

    const openEventDialog = (event: BookingCalendarEvent) => {
        openExistingReservation(event);
    };

    return (
        <>
            <div className="mx-auto w-full max-w-7xl space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        to="/bookings"
                        className="inline-flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase no-underline transition-colors hover:text-(--bone)"
                    >
                        <ArrowLeft className="size-4" strokeWidth={1.4} />
                        <span>Calendar</span>
                    </Link>
                    <Link
                        to="/my-bookings"
                        className="text-[0.66rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase no-underline transition-colors hover:text-(--bone)"
                    >
                        My Bookings
                    </Link>
                </div>

                <header className="grid gap-6 border-b border-(--hairline) pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <p className="eyebrow text-(--gold)">Room Day Detail</p>
                            <span className="inline-flex border border-(--signal)/40 bg-(--signal)/10 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-(--signal) uppercase">
                                Available
                            </span>
                        </div>
                        <h1 className="display-italic mt-3 text-4xl leading-none font-normal text-(--bone) md:text-5xl">
                            {room.title}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-(--bone-muted)">
                            {room.location} with capacity for {room.capacity} people. Today's ledger is scoped to this
                            room's reservations and open time.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => bookableSlot && openReservationEditor(bookableSlot)}
                        disabled={!bookableSlot}
                        className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 border border-(--bone) bg-(--bone) px-5 text-[0.66rem] font-semibold tracking-[0.24em] text-black uppercase transition-all hover:bg-white disabled:cursor-not-allowed disabled:border-(--hairline) disabled:bg-transparent disabled:text-(--bone-dim)"
                    >
                        <Plus className="size-4" strokeWidth={1.7} />
                        <span>{bookableSlot ? "Book This Room" : "No Slots"}</span>
                    </button>
                </header>

                <RoomDaySummary />

                <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-7">
                        <Schedule
                            onBook={openReservationEditor}
                            onDateChange={goToDate}
                            onOpenBooking={openEventDialog}
                            segments={segments}
                            selectedDate={selectedDate}
                        />
                        <NextOpening bookableSlot={bookableSlot} />
                    </div>
                    <Equipment room={room} />
                </section>
            </div>

            <ReservationEditorDialog />
        </>
    );
};
