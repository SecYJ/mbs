import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BookingReservationDetails } from "@/features/bookings/components/booking-reservation-details";
import { BookingReservationForm } from "@/features/bookings/components/booking-reservation-form";
import type { BookingReservationDialogState } from "@/features/bookings/components/booking-reservation-editor.types";
import { useBookingReservationEditor } from "@/features/bookings/hooks/useBookingReservationEditor";
import { useBookingCalendarStore } from "@/features/bookings/stores/booking-calendar-store";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/shallow";

type BookingReservationEditorDialogProps = {
    dialogState?: BookingReservationDialogState | null;
    onOpenChange?: (open: boolean) => void;
    useUrlBackedAttendeeSearch?: boolean;
};

export const BookingReservationEditorDialog = ({
    dialogState,
    onOpenChange,
    useUrlBackedAttendeeSearch,
}: BookingReservationEditorDialogProps = {}) => {
    if (dialogState !== undefined && onOpenChange) {
        return (
            <BookingReservationEditorDialogContent
                dialogState={dialogState}
                onOpenChange={onOpenChange}
                useUrlBackedAttendeeSearch={useUrlBackedAttendeeSearch ?? false}
            />
        );
    }

    return <StoreBackedBookingReservationEditorDialog />;
};

const BookingReservationEditorDialogContent = ({
    dialogState: activeDialogState,
    onOpenChange,
    useUrlBackedAttendeeSearch,
}: {
    dialogState: BookingReservationDialogState | null;
    onOpenChange: (open: boolean) => void;
    useUrlBackedAttendeeSearch: boolean;
}) => {
    const {
        canManage,
        cancelReservation,
        dialogState,
        event,
        formError,
        mutationFlow,
        isDetailsMode,
        isEditMode,
        isFormSubmitting,
        isMissingReservation,
        onCancelForm,
        onOpenChange: handleDialogOpenChange,
        onStartEditing,
        onSubmit,
        initialDetails,
        resetKey,
        selectedRoom,
        widthClass,
    } = useBookingReservationEditor({ dialogState: activeDialogState, onOpenChange });

    if (!dialogState) return null;

    if (isMissingReservation) {
        return (
            <Dialog key={resetKey} open onOpenChange={handleDialogOpenChange}>
                <DialogContent className="rounded-none border border-(--hairline) bg-(--surface-01) text-(--bone) shadow-[0_40px_80px_rgba(0,0,0,0.6)] sm:max-w-md">
                    <div className="space-y-2">
                        <p className="eyebrow text-(--gold)">Reservation</p>
                        <h2 className="display-italic text-[1.75rem] leading-[1.05] font-normal text-(--bone)">
                            Reservation unavailable.
                        </h2>
                        <p className="text-[0.78rem] text-(--bone-muted)">
                            This booking could not be found in the current calendar data.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog key={resetKey} open onOpenChange={handleDialogOpenChange}>
            <DialogContent
                className={cn(
                    "rounded-none border border-(--hairline) bg-(--surface-01) text-(--bone) shadow-[0_40px_80px_rgba(0,0,0,0.6)]",
                    widthClass,
                )}
            >
                {isDetailsMode && event ? (
                    <BookingReservationDetails
                        canManage={canManage}
                        cancelError={mutationFlow.cancelError}
                        event={event}
                        isCancelling={mutationFlow.isCancelling}
                        onCancelBooking={cancelReservation}
                        onEdit={onStartEditing}
                        selectedRoom={selectedRoom}
                    />
                ) : (
                    <BookingReservationForm
                        error={formError}
                        event={event}
                        isEditing={isEditMode}
                        isSubmitting={isFormSubmitting}
                        onCancel={onCancelForm}
                        onSubmit={onSubmit}
                        initialDetails={initialDetails}
                        useUrlBackedAttendeeSearch={useUrlBackedAttendeeSearch}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

const StoreBackedBookingReservationEditorDialog = () => {
    const [dialogState, { closeReservationDialog }] = useBookingCalendarStore(
        useShallow((state) => [state.activeReservationDialog, state.actions]),
    );

    const handleOpenChange = (open: boolean) => {
        if (!open) closeReservationDialog();
    };

    return (
        <BookingReservationEditorDialogContent
            dialogState={dialogState}
            onOpenChange={handleOpenChange}
            useUrlBackedAttendeeSearch
        />
    );
};
