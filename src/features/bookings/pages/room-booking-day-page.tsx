import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";

import { BookingReservationEditorDialog } from "@/features/bookings/components/booking-reservation-editor-dialog";
import type { BookingReservationDialogState } from "@/features/bookings/components/booking-reservation-editor.types";
import { RoomBookingEquipment } from "@/features/bookings/components/room-booking-equipment";
import { RoomBookingSchedule } from "@/features/bookings/components/room-booking-schedule";
import { RoomBookingSummary } from "@/features/bookings/components/room-booking-summary";
import { useRoomBookingDayModel } from "@/features/bookings/hooks/useRoomBookingDayModel";
import { getBookingEventInput, type BookingCalendarEvent } from "@/features/bookings/utils/booking-calendar";
import { cn } from "@/lib/utils";

export const RoomBookingDayPage = () => <RoomBookingDayPageContent />;

const RoomBookingDayPageContent = () => {
    const [activeReservationDialog, setActiveReservationDialog] = useState<BookingReservationDialogState | null>(null);

    const { bookableSlot, goToDate, room, segments, selectedDate } = useRoomBookingDayModel();

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

    const openBookingReservationEditor = (slot: { start: Date; end: Date }) => {
        setActiveReservationDialog({
            mode: "create",
            initialDetails: { roomId: room.id, start: slot.start, end: slot.end },
        });
    };

    const openEventDialog = (event: BookingCalendarEvent) => {
        setActiveReservationDialog({ mode: "view", event: getBookingEventInput(event) });
    };

    const handleReservationDialogOpenChange = (open: boolean) => {
        if (!open) {
            setActiveReservationDialog(null);
        }
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
                            <span
                                className={cn(
                                    "inline-flex border px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] uppercase",
                                    room.available
                                        ? "border-(--signal)/40 bg-(--signal)/10 text-(--signal)"
                                        : "border-red-300/40 bg-red-500/10 text-red-100",
                                )}
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

                <RoomBookingSummary />

                <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <RoomBookingSchedule
                        onBook={openBookingReservationEditor}
                        onDateChange={goToDate}
                        onOpenBooking={openEventDialog}
                        roomAvailable={room.available}
                        segments={segments}
                        selectedDate={selectedDate}
                    />
                    <RoomBookingEquipment
                        bookableSlot={bookableSlot}
                        onBook={openBookingReservationEditor}
                        room={room}
                    />
                </section>
            </div>

            {activeReservationDialog ? (
                <BookingReservationEditorDialog
                    dialogState={activeReservationDialog}
                    onOpenChange={handleReservationDialogOpenChange}
                    useUrlBackedAttendeeSearch
                />
            ) : null}
        </>
    );
};
