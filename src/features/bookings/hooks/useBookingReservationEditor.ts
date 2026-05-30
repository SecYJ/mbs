import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { EventInput } from "@fullcalendar/core";

import type {
    BookingFormData,
    BookingReservationEditorControls,
    BookingReservationMode,
    BookingReservationPrefill,
} from "@/features/bookings/components/booking-reservation-editor.types";
import { useBookingMutationFlow } from "@/features/bookings/hooks/useBookingMutationFlow";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import { getBookingEventInput, type BookingCalendarEvent } from "@/features/bookings/utils/booking-calendar.utils";

const emptyPrefill: BookingReservationPrefill = {};

type BookingReservationEditorState = {
    event: EventInput | null;
    mode: BookingReservationMode;
    open: boolean;
    prefill: BookingReservationPrefill;
};

const getEditorResetKey = ({
    currentUserId,
    event,
    mode,
    prefill,
}: BookingReservationEditorState & { currentUserId?: string }) => {
    const eventKey = event?.id ? String(event.id) : "new";
    const prefillStart = prefill.start?.toISOString() ?? "";
    const prefillEnd = prefill.end?.toISOString() ?? "";

    return [mode, eventKey, prefill.roomId ?? "", prefillStart, prefillEnd, currentUserId ?? ""].join("|");
};

const getSelectedBooking = (event: EventInput | null, events: BookingCalendarEvent[]) => {
    if (!event?.id) return null;
    return events.find((booking) => booking.id === String(event.id)) ?? null;
};

const getEventRoomId = (event: EventInput | null) =>
    String(event?.resourceId ?? event?.extendedProps?.resourceId ?? "");

export const useBookingReservationEditor = ({
    onClose,
}: {
    onClose?: () => void;
} = {}) => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const [editor, setEditor] = useState<BookingReservationEditorState>({
        event: null,
        mode: "create",
        open: false,
        prefill: emptyPrefill,
    });
    const [isEditing, setIsEditing] = useState(false);

    const closeEditor = () => {
        setEditor((current) => ({ ...current, open: false }));
        setIsEditing(false);
        onClose?.();
    };

    const mutationFlow = useBookingMutationFlow({ onCompleted: closeEditor });

    const openNewReservation: BookingReservationEditorControls["openNewReservation"] = (nextPrefill = {}) => {
        mutationFlow.reset();
        setIsEditing(false);
        setEditor({
            event: null,
            mode: "create",
            open: true,
            prefill: nextPrefill,
        });
    };

    const openExistingReservation: BookingReservationEditorControls["openExistingReservation"] = (event) => {
        mutationFlow.reset();
        setIsEditing(false);
        setEditor({
            event,
            mode: "view",
            open: true,
            prefill: emptyPrefill,
        });
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setEditor((current) => ({ ...current, open: true }));
            return;
        }

        closeEditor();
    };

    const selectedBooking = getSelectedBooking(editor.event, data.events);
    const event = selectedBooking ? getBookingEventInput(selectedBooking) : editor.event;
    const isViewingDetails = editor.mode === "view" && !!event && !isEditing;
    const isEditingReservation = editor.mode === "view" && isEditing;
    const selectedRoomId = isViewingDetails ? getEventRoomId(event) : undefined;
    const selectedRoom = selectedRoomId ? data.rooms.find((room) => room.id === selectedRoomId) : undefined;
    const canManage =
        editor.mode === "view" && (selectedBooking?.canManage ?? event?.extendedProps?.canManage) === true;

    const submitReservation = (formData: BookingFormData) => {
        if (isEditingReservation && event?.id) {
            mutationFlow.updateBookingReservation(String(event.id), formData);
            return;
        }

        mutationFlow.submitBooking(formData);
    };

    const cancelReservation = (cancelReason: string) => {
        if (!event?.id) return;
        mutationFlow.cancelBookingReservation(String(event.id), cancelReason);
    };

    const cancelForm = () => {
        if (isEditingReservation) {
            setIsEditing(false);
            return;
        }

        closeEditor();
    };

    return {
        controls: {
            openExistingReservation,
            openNewReservation,
        },
        dialog: {
            canManage,
            cancelError: mutationFlow.cancelError,
            cancelReservation,
            currentUserId: data.currentUserId,
            error: isEditingReservation ? mutationFlow.updateError : mutationFlow.createError,
            event,
            isCancelling: mutationFlow.isCancelling,
            isEditingReservation,
            isSubmitting: isEditingReservation ? mutationFlow.isUpdating : mutationFlow.isSubmitting,
            isUnavailable: editor.mode === "view" && !event,
            isViewingDetails,
            onCancelForm: cancelForm,
            onOpenChange: handleOpenChange,
            onStartEditing: () => setIsEditing(true),
            onSubmit: submitReservation,
            open: editor.open,
            prefill: editor.prefill,
            resetKey: getEditorResetKey({ ...editor, currentUserId: data.currentUserId }),
            rooms: data.rooms,
            selectedRoom,
            users: data.users,
            widthClass: isViewingDetails ? "sm:max-w-md" : "sm:max-w-lg",
        },
    };
};
