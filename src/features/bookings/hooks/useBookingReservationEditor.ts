import { useState } from "react";
import { useMutationState, useSuspenseQuery } from "@tanstack/react-query";
import type { EventInput } from "@fullcalendar/core";

import type {
    BookingFormData,
    BookingReservationDialogState,
    BookingReservationInitialDetails,
} from "@/features/bookings/components/booking-reservation-editor.types";
import { resolveEditorView } from "@/features/bookings/hooks/booking-reservation-editor-view";
import { useBookingMutationFlow } from "@/features/bookings/hooks/useBookingMutationFlow";
import { BOOKING_MUTATION_KEYS } from "@/features/bookings/services/mutationOpts";
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

type BookingMutationVariablesWithId = {
    data: {
        bookingId: string;
    };
};

const useIsBookingSubmitting = ({ isEditMode, bookingId }: { isEditMode: boolean; bookingId: string }) => {
    const pendingCreateBookings = useMutationState({
        filters: { mutationKey: BOOKING_MUTATION_KEYS.create, status: "pending" },
    });
    const pendingUpdateBookings = useMutationState<BookingMutationVariablesWithId>({
        filters: { mutationKey: BOOKING_MUTATION_KEYS.update, status: "pending" },
        select: (mutation) => mutation.state.variables as BookingMutationVariablesWithId,
    });

    return isEditMode
        ? pendingUpdateBookings.some((variables) => variables.data.bookingId === bookingId)
        : pendingCreateBookings.length > 0;
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

    const view = resolveEditorView({
        isOpen: !!dialogState,
        isExistingReservation,
        hasEvent: !!event,
        isEditing,
    });

    const isDetailsMode = view === "details";
    const isEditMode = view === "edit";
    const isMissingReservation = view === "missing";

    const selectedRoomId = isDetailsMode ? getEventRoomId(event) : undefined;
    const selectedRoom = selectedRoomId ? data.rooms.find((room) => room.id === selectedRoomId) : undefined;
    const canManage = isExistingReservation && (selectedBooking?.canManage ?? event?.extendedProps?.canManage) === true;
    const isFormSubmitting = useIsBookingSubmitting({ isEditMode, bookingId: String(event?.id ?? "") });

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

    return {
        canManage,
        cancelError,
        cancelReservation,
        event,
        formError,
        initialDetails,
        isDetailsMode,
        isEditMode,
        isFormSubmitting,
        isMissingReservation,
        onCancelForm: cancelForm,
        onOpenChange: handleOpenChange,
        onStartEditing: () => setIsEditing(true),
        onSubmit: submitReservation,
        resetKey: dialogState ? getEditorResetKey({ currentUserId: data.currentUserId, dialogState }) : "closed",
        selectedRoom,
        widthClass: isDetailsMode ? "sm:max-w-md" : "sm:max-w-lg",
    };
};
