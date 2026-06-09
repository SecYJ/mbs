import { useState } from "react";
import { useMutationState, useSuspenseQuery } from "@tanstack/react-query";

import type {
    BookingFormData,
    BookingReservationDialogState,
    BookingReservationInitialDetails,
} from "@/features/bookings/components/booking-reservation-editor.types";
import { useBookingMutationFlow } from "@/features/bookings/hooks/useBookingMutationFlow";
import { BOOKING_MUTATION_KEYS } from "@/features/bookings/services/mutationOpts";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import { getBookingEventInput } from "@/features/bookings/utils/booking-calendar";

const emptyInitialDetails: BookingReservationInitialDetails = {};

type UseBookingReservationEditorOptions = {
    dialogState: BookingReservationDialogState | null;
    onClose: () => void;
};

type BookingMutationVariablesWithId = {
    data: {
        bookingId: string;
    };
};

export const useBookingReservationEditor = ({ dialogState, onClose }: UseBookingReservationEditorOptions) => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const [isEditing, setIsEditing] = useState(false);
    const isExistingReservation = dialogState?.mode === "view";
    const initialDetails =
        dialogState?.mode === "create" ? (dialogState.initialDetails ?? emptyInitialDetails) : emptyInitialDetails;
    const sourceEvent = dialogState?.mode === "view" ? dialogState.event : null;

    const closeEditor = () => {
        setIsEditing(false);
        onClose();
    };

    const mutationFlow = useBookingMutationFlow({ onCompleted: closeEditor });

    const selectedBooking = sourceEvent?.id
        ? (data.events.find((booking) => booking.id === String(sourceEvent.id)) ?? null)
        : null;
    const event = selectedBooking ? getBookingEventInput(selectedBooking) : sourceEvent;

    // Each guard is ordered from most to least specific so every line reads as
    // a single rule: no context -> closed, new booking -> create, existing but
    // not in the calendar data -> missing, then edit/details by user intent.
    const view = !dialogState
        ? "closed"
        : !isExistingReservation
          ? "create"
          : !event
            ? "missing"
            : isEditing
              ? "edit"
              : "details";
    const isEditMode = view === "edit";

    const roomId = String(event?.resourceId ?? event?.extendedProps?.resourceId ?? "");
    const selectedRoom = view === "details" ? data.rooms.find((room) => room.id === roomId) : undefined;
    const canManage = isExistingReservation && (selectedBooking?.canManage ?? event?.extendedProps?.canManage) === true;

    const pendingCreateBookings = useMutationState({
        filters: { mutationKey: BOOKING_MUTATION_KEYS.create, status: "pending" },
    });
    const pendingUpdateBookings = useMutationState<BookingMutationVariablesWithId>({
        filters: { mutationKey: BOOKING_MUTATION_KEYS.update, status: "pending" },
        select: (mutation) => mutation.state.variables as BookingMutationVariablesWithId,
    });
    const isFormSubmitting = isEditMode
        ? pendingUpdateBookings.some((variables) => variables.data.bookingId === String(event?.id ?? ""))
        : pendingCreateBookings.length > 0;

    const submitReservation = (formData: BookingFormData) => {
        const bookingFields = {
            title: formData.title,
            roomId: formData.roomId,
            startTime: formData.start.toISOString(),
            endTime: formData.end.toISOString(),
            attendeeIds: formData.attendeeIds,
            description: formData.description,
        };

        if (isEditMode && event?.id) {
            mutationFlow.updateBookingMutation.mutate({ data: { bookingId: String(event.id), ...bookingFields } });
            return;
        }

        mutationFlow.createBookingMutation.mutate({ data: bookingFields });
    };

    const cancelReservation = (cancelReason: string) => {
        if (!event?.id) return;
        mutationFlow.cancelBookingMutation.mutate({ data: { bookingId: String(event.id), cancelReason } });
    };

    const cancelForm = () => {
        if (isEditMode) {
            setIsEditing(false);
            return;
        }

        closeEditor();
    };

    const cancelError =
        mutationFlow.cancelBookingMutation.error instanceof Error
            ? mutationFlow.cancelBookingMutation.error.message
            : null;
    const formMutation = isEditMode ? mutationFlow.updateBookingMutation : mutationFlow.createBookingMutation;
    const formError = formMutation.error instanceof Error ? formMutation.error.message : null;

    const resetKey = !dialogState
        ? "closed"
        : dialogState.mode === "view"
          ? ["view", dialogState.event.id ? String(dialogState.event.id) : "new", data.currentUserId ?? ""].join("|")
          : [
                "create",
                initialDetails.roomId ?? "",
                initialDetails.start?.toISOString() ?? "",
                initialDetails.end?.toISOString() ?? "",
                data.currentUserId ?? "",
            ].join("|");

    return {
        canManage,
        cancelError,
        cancelReservation,
        event,
        formError,
        initialDetails,
        isFormSubmitting,
        onCancelForm: cancelForm,
        onOpenChange: (open: boolean) => {
            if (!open) closeEditor();
        },
        onStartEditing: () => setIsEditing(true),
        onSubmit: submitReservation,
        resetKey,
        selectedRoom,
        view,
    };
};
