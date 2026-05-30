import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";

import { BookingReservationEditor } from "@/features/bookings/components/booking-reservation-editor";
import type { BookingReservationEditorControls } from "@/features/bookings/components/booking-reservation-editor.types";
import { RoomBookingEquipment } from "@/features/bookings/components/room-booking-equipment";
import { RoomBookingSchedule } from "@/features/bookings/components/room-booking-schedule";
import { RoomBookingSummary } from "@/features/bookings/components/room-booking-summary";
import { useRoomBookingDayModel } from "@/features/bookings/hooks/useRoomBookingDayModel";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import { getBookingEventInput, type BookingCalendarEvent } from "@/features/bookings/utils/booking-calendar.utils";
import { formatDateKey } from "@/features/bookings/utils/room-booking-day.utils";

export const RoomBookingDayPage = () => (
    <BookingReservationEditor>
        {(reservationEditor) => <RoomBookingDayPageContent {...reservationEditor} />}
    </BookingReservationEditor>
);

const RoomBookingDayPageContent = ({
    openExistingReservation,
    openNewReservation,
}: BookingReservationEditorControls) => {
    const { roomId } = useParams({ from: "/_bookings/rooms/$roomId" });
    const { date } = useSearch({ from: "/_bookings/rooms/$roomId" });
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const navigate = useNavigate({ from: "/rooms/$roomId" });

    const { bookableSlot, dayEvents, freeMinutes, liveEvent, room, segments, selectedDate } = useRoomBookingDayModel({
        data,
        date,
        roomId,
    });

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
                    <p className="eyebrow eyebrow-gold">Room Details</p>
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

    const goToDate = (nextDate: Date) => {
        navigate({
            search: (prev) => ({ ...prev, date: formatDateKey(nextDate) }),
            replace: true,
        });
    };

    const openBookingReservationEditor = (slot: { start: Date; end: Date }) => {
        openNewReservation({ roomId: room.id, start: slot.start, end: slot.end });
    };

    const openEventDialog = (event: BookingCalendarEvent) => {
        openExistingReservation(getBookingEventInput(event));
    };

    return (
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
                        <p className="eyebrow eyebrow-gold">Room Day Detail</p>
                        <span
                            className={
                                room.available
                                    ? "inline-flex border border-(--signal)/40 bg-(--signal)/10 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-(--signal) uppercase"
                                    : "inline-flex border border-red-300/40 bg-red-500/10 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-red-100 uppercase"
                            }
                        >
                            {room.available ? "Available" : "Unavailable"}
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
                    onClick={() => bookableSlot && openBookingReservationEditor(bookableSlot)}
                    disabled={!bookableSlot}
                    className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 border border-(--bone) bg-(--bone) px-5 text-[0.66rem] font-semibold tracking-[0.24em] text-black uppercase transition-all hover:bg-white disabled:cursor-not-allowed disabled:border-(--hairline) disabled:bg-transparent disabled:text-(--bone-dim)"
                >
                    <Plus className="size-4" strokeWidth={1.7} />
                    <span>{bookableSlot ? "Book This Room" : "No Slots"}</span>
                </button>
            </header>

            <RoomBookingSummary
                bookingCount={dayEvents.length}
                freeMinutes={freeMinutes}
                liveEvent={liveEvent}
                room={room}
            />

            <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
                <RoomBookingSchedule
                    onBook={openBookingReservationEditor}
                    onDateChange={goToDate}
                    onOpenBooking={openEventDialog}
                    roomAvailable={room.available}
                    segments={segments}
                    selectedDate={selectedDate}
                />
                <RoomBookingEquipment bookableSlot={bookableSlot} onBook={openBookingReservationEditor} room={room} />
            </section>
        </div>
    );
};
