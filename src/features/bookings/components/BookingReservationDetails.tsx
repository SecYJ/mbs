import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { Ban, Clock, MapPin, Pencil, Users } from "lucide-react";
import { useShallow } from "zustand/shallow";
import { z } from "zod";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookingReservationForm } from "@/features/bookings/components/BookingReservationForm";
import type {
    BookingReservationEditing,
    BookingReservationPayload,
} from "@/features/bookings/components/booking-reservation-editor.types";
import { useBookingCalendarEvents } from "@/features/bookings/hooks/useBookingCalendarEvents";
import { cancelBookingFn, updateBookingFn } from "@/features/bookings/services/fns";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import { useBookingCalendarStore } from "@/features/bookings/stores/booking-calendar-store";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";

const bookingReservationExtendedPropsSchema = z.object({
    attendees: z.string().array().catch([]),
    description: z.string().catch(""),
    organizer: z.string().catch(""),
});

// View mode of the reservation dialog. Reads the dialog state from the store
// directly, so the component needs no props.
const useBookingReservationView = () => {
    const [dialogState, { closeReservationDialog, setReservationEditing }] = useBookingCalendarStore(
        useShallow((state) => [state.activeReservationDialog, state.actions]),
    );
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const calendarEvents = useBookingCalendarEvents();

    const queryClient = useQueryClient();
    const updateBooking = useServerFn(updateBookingFn);
    const cancelBooking = useServerFn(cancelBookingFn);

    const handleMutationSuccess = async () => {
        await Promise.all([
            queryClient.invalidateQueries(bookingCalendarQueryOptions()),
            queryClient.invalidateQueries(notificationsQueryOptions()),
        ]);

        closeReservationDialog();
    };

    const updateBookingMutation = useMutation({ mutationFn: updateBooking, onSuccess: handleMutationSuccess });
    const cancelBookingMutation = useMutation({ mutationFn: cancelBooking, onSuccess: handleMutationSuccess });

    if (dialogState?.mode !== "view") {
        throw new Error("BookingReservationDetails must only render while the reservation dialog is in view mode");
    }

    // dialogState.event is the FullCalendar event captured when the dialog
    // opened. Prefer the same booking re-read from the latest query data; fall
    // back to the snapshot while the query catches up.
    const snapshotEvent = dialogState.event;
    const eventId = snapshotEvent.id ? String(snapshotEvent.id) : null;
    const event = (eventId ? calendarEvents.find((booking) => booking.id === eventId) : null) ?? snapshotEvent;

    const roomId = String(event.resourceId ?? event.extendedProps?.resourceId ?? "");
    const selectedRoom = data.rooms.find((room) => room.id === roomId);
    const canManage = event.extendedProps?.canManage === true;

    // Passed straight to BookingReservationForm when the user enters edit mode.
    const editing: BookingReservationEditing = {
        error: updateBookingMutation.error instanceof Error ? updateBookingMutation.error.message : null,
        event,
        isSubmitting: updateBookingMutation.isPending,
        onCancel: () => setReservationEditing(false),
        onSubmit: (payload: BookingReservationPayload) => {
            if (!eventId) return;
            updateBookingMutation.mutate({ data: { bookingId: eventId, ...payload } });
        },
    };

    return {
        canManage,
        cancelError: cancelBookingMutation.error instanceof Error ? cancelBookingMutation.error.message : null,
        editing,
        event,
        isCancelling: cancelBookingMutation.isPending,
        isEditing: dialogState.isEditing,
        onCancelBooking: (cancelReason: string) => {
            if (!eventId) return;
            cancelBookingMutation.mutate({ data: { bookingId: eventId, cancelReason } });
        },
        onStartEditing: () => setReservationEditing(true),
        selectedRoom,
    };
};

export const BookingReservationDetails = () => {
    const {
        canManage,
        cancelError,
        editing,
        event,
        isCancelling,
        isEditing,
        onCancelBooking,
        onStartEditing,
        selectedRoom,
    } = useBookingReservationView();
    const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    if (isEditing) return <BookingReservationForm editing={editing} />;

    const {
        attendees,
        description,
        organizer: organizerName,
    } = bookingReservationExtendedPropsSchema.parse(event.extendedProps);

    const organizer = organizerName || "Unknown";
    const startDate = event.start ? new Date(String(event.start)) : null;
    const endDate = event.end ? new Date(String(event.end)) : null;

    const requestCancelBooking = () => {
        if (!event.id || isCancelling) return;

        setCancelConfirmOpen(true);
        setCancelReason("");
    };

    const confirmCancelBooking = () => {
        if (!event.id || isCancelling) return;

        onCancelBooking(cancelReason);
    };

    return (
        <>
            <div className="space-y-2">
                <p className="eyebrow text-(--gold)">Reservation</p>
                <h2 className="display-italic text-[1.75rem] leading-[1.05] font-normal text-(--bone)">
                    {event.title}
                </h2>
                <p className="text-[0.78rem] text-(--bone-muted)">
                    Organized by <span className="text-(--bone)">{organizer}</span>
                </p>
            </div>

            <div className="mt-4 border-t border-(--hairline) pt-6">
                <dl className="space-y-5">
                    {selectedRoom && (
                        <InfoRow icon={<MapPin className="size-3.75" strokeWidth={1.4} />} label="Room">
                            <span className="text-[0.88rem] font-medium text-(--bone)">{selectedRoom.title}</span>
                            <span className="tabular-num ml-2 text-[0.72rem] text-(--bone-dim)">
                                {selectedRoom.location} &middot; {selectedRoom.capacity}p
                            </span>
                        </InfoRow>
                    )}

                    <InfoRow icon={<Clock className="size-3.75" strokeWidth={1.4} />} label="Time">
                        <span className="tabular-num text-[0.95rem] font-medium text-(--gold)">
                            {startDate ? format(startDate, "HH:mm") : ""} &mdash;{" "}
                            {endDate ? format(endDate, "HH:mm") : ""}
                        </span>
                        <span className="ml-3 text-[0.72rem] text-(--bone-dim)">
                            {startDate ? format(startDate, "EEE, MMM d") : ""}
                        </span>
                    </InfoRow>

                    {attendees.length > 0 ? (
                        <InfoRow icon={<Users className="size-3.75" strokeWidth={1.4} />} label="Attendees">
                            <div className="flex flex-wrap gap-1.5">
                                {attendees.map((attendee) => (
                                    <span
                                        key={attendee}
                                        className="border border-(--hairline) px-2 py-0.5 text-[0.7rem] text-(--bone-muted)"
                                    >
                                        {attendee}
                                    </span>
                                ))}
                            </div>
                        </InfoRow>
                    ) : null}

                    {description ? (
                        <InfoRow icon={<Pencil className="size-3.75" strokeWidth={1.4} />} label="Notes">
                            <p className="text-[0.82rem] leading-relaxed text-(--bone-muted)">{description}</p>
                        </InfoRow>
                    ) : null}
                </dl>
            </div>

            {(canManage || cancelError) && (
                <div className="mt-6 border-t border-(--hairline) pt-5">
                    {cancelError && (
                        <p className="mb-3 border border-red-400/30 bg-red-500/10 px-3 py-2 text-[0.75rem] text-red-200">
                            {cancelError}
                        </p>
                    )}
                    {canManage && !cancelConfirmOpen && (
                        <BookingReservationActionButtons
                            isCancelling={isCancelling}
                            onCancel={requestCancelBooking}
                            onEdit={onStartEditing}
                        />
                    )}
                    {canManage && cancelConfirmOpen && (
                        <div className="space-y-3">
                            <p className="text-[0.78rem] leading-snug text-(--bone-muted)">Cancel this booking?</p>
                            <div className="space-y-2">
                                <Label className="eyebrow block">
                                    Reason <span className="ml-1 text-(--bone-faint)">(optional)</span>
                                </Label>
                                <Textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Change of plans, room no longer needed..."
                                    rows={3}
                                    className="resize-none rounded-none border border-(--hairline) bg-(--surface-02) px-3 py-2.5 text-[0.84rem] leading-relaxed text-(--bone) shadow-none placeholder:text-(--bone-faint) focus:border-(--gold) focus-visible:ring-0"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCancelConfirmOpen(false)}
                                    disabled={isCancelling}
                                    className="h-9 cursor-pointer border border-(--hairline) px-4 text-[0.62rem] font-semibold tracking-[0.24em] text-(--bone-muted) uppercase transition-all hover:border-(--hairline-strong) hover:text-(--bone) disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Keep
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmCancelBooking}
                                    disabled={isCancelling}
                                    className="flex h-9 cursor-pointer items-center justify-center gap-2 border border-red-300/50 bg-red-500/10 px-4 text-[0.62rem] font-semibold tracking-[0.24em] text-red-100 uppercase transition-all hover:border-red-200 hover:bg-red-500/20 hover:text-white disabled:cursor-wait disabled:opacity-70"
                                >
                                    <Ban className="size-3.5" strokeWidth={1.6} />
                                    <span>{isCancelling ? "Cancelling" : "Confirm"}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

const BookingReservationActionButtons = ({
    isCancelling,
    onCancel,
    onEdit,
}: {
    isCancelling: boolean;
    onCancel: () => void;
    onEdit: () => void;
}) => (
    <div className="grid grid-cols-2 gap-3">
        <button
            type="button"
            onClick={onEdit}
            disabled={isCancelling}
            className="flex cursor-pointer items-center justify-center gap-2 border border-(--hairline) py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] text-(--bone-muted) uppercase transition-all hover:border-(--hairline-strong) hover:text-(--bone) disabled:cursor-not-allowed disabled:opacity-60"
        >
            <Pencil className="size-4" strokeWidth={1.6} />
            <span>Edit</span>
        </button>
        <button
            type="button"
            onClick={onCancel}
            disabled={isCancelling}
            aria-label="Cancel booking"
            className="flex cursor-pointer items-center justify-center gap-2 border border-red-300/50 bg-red-500/10 py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] text-red-100 uppercase transition-all hover:border-red-200 hover:bg-red-500/20 hover:text-white disabled:cursor-wait disabled:opacity-70"
        >
            <Ban className="size-4" strokeWidth={1.6} />
            <span>Cancel</span>
        </button>
    </div>
);

const InfoRow = ({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) => (
    <div className="grid grid-cols-[88px_1fr] items-start gap-4">
        <div className="flex items-center gap-2 pt-0.5">
            <span className="text-(--bone-dim)">{icon}</span>
            <span className="eyebrow">{label}</span>
        </div>
        <div className="flex flex-wrap items-baseline">{children}</div>
    </div>
);
