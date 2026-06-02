import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { EventInput } from "@fullcalendar/core";

import type {
    BookingFormData,
    BookingReservationDialogState,
    BookingReservationInitialDetails,
} from "@/features/bookings/components/booking-reservation-editor.types";
import { useBookingMutationFlow } from "@/features/bookings/hooks/useBookingMutationFlow";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import { getBookingEventInput, type BookingCalendarEvent } from "@/features/bookings/utils/booking-calendar";

const emptyInitialDetails: BookingReservationInitialDetails = {};

const getEditorResetKey = ({
    currentUserId,
    dialogState,
}: {
    currentUserId?: string;
    dialogState: BookingReservationDialogState;
}) => {
    if (dialogState.mode === "view") {
        return ["view", dialogState.event.id ? String(dialogState.event.id) : "new", currentUserId ?? ""].join("|");
    }

    const initialDetails = dialogState.initialDetails ?? emptyInitialDetails;

    return [
        "create",
        initialDetails.roomId ?? "",
        initialDetails.start?.toISOString() ?? "",
        initialDetails.end?.toISOString() ?? "",
        currentUserId ?? "",
    ].join("|");
};

const getSelectedBooking = (event: EventInput | null, events: BookingCalendarEvent[]) => {
    if (!event?.id) return null;
    return events.find((booking) => booking.id === String(event.id)) ?? null;
};

const getEventRoomId = (event: EventInput | null) =>
    String(event?.resourceId ?? event?.extendedProps?.resourceId ?? "");

type UseBookingReservationEditorOptions = {
    dialogState: BookingReservationDialogState | null;
    onOpenChange: (open: boolean) => void;
};

export const useBookingReservationEditor = ({ dialogState, onOpenChange }: UseBookingReservationEditorOptions) => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const [isEditing, setIsEditing] = useState(false);
    const isExistingReservation = dialogState?.mode === "view";
    const initialDetails =
        dialogState?.mode === "create" ? (dialogState.initialDetails ?? emptyInitialDetails) : emptyInitialDetails;
    const sourceEvent = dialogState?.mode === "view" ? dialogState.event : null;

    const closeEditor = () => {
        setIsEditing(false);
        onOpenChange(false);
    };

    const mutationFlow = useBookingMutationFlow({ onCompleted: closeEditor });

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            onOpenChange(true);
            return;
        }

        closeEditor();
    };

    const selectedBooking = getSelectedBooking(sourceEvent, data.events);
    const event = selectedBooking ? getBookingEventInput(selectedBooking) : sourceEvent;
    const isDetailsMode = isExistingReservation && !!event && !isEditing;
    const isEditMode = isExistingReservation && isEditing;
    const isMissingReservation = isExistingReservation && !event;
    const selectedRoomId = isDetailsMode ? getEventRoomId(event) : undefined;
    const selectedRoom = selectedRoomId ? data.rooms.find((room) => room.id === selectedRoomId) : undefined;
    const canManage = isExistingReservation && (selectedBooking?.canManage ?? event?.extendedProps?.canManage) === true;

    const submitReservation = (formData: BookingFormData) => {
        if (isEditMode && event?.id) {
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
        if (isEditMode) {
            setIsEditing(false);
            return;
        }

        closeEditor();
    };

    return {
        canManage,
        cancelReservation,
        dialogState,
        event,
        formError: isEditMode ? mutationFlow.updateError : mutationFlow.createError,
        initialDetails,
        isDetailsMode,
        isEditMode,
        isFormSubmitting: isEditMode ? mutationFlow.isUpdating : mutationFlow.isSubmitting,
        isMissingReservation,
        mutationFlow,
        onCancelForm: cancelForm,
        onOpenChange: handleOpenChange,
        onStartEditing: () => setIsEditing(true),
        onSubmit: submitReservation,
        resetKey: dialogState ? getEditorResetKey({ currentUserId: data.currentUserId, dialogState }) : "closed",
        selectedRoom,
        widthClass: isDetailsMode ? "sm:max-w-md" : "sm:max-w-lg",
    };
};
