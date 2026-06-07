import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BookingReservationDetails } from "@/features/bookings/components/booking-reservation-details";
import { BookingReservationForm } from "@/features/bookings/components/booking-reservation-form";
import { useBookingReservationEditor } from "@/features/bookings/hooks/useBookingReservationEditor";
import { useBookingCalendarStore } from "@/features/bookings/stores/booking-calendar-store";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/shallow";

export const BookingReservationEditorDialog = () => {
    const [dialogState, { closeReservationDialog }] = useBookingCalendarStore(
        useShallow((state) => [state.activeReservationDialog, state.actions]),
    );

    const onOpenChange = (open: boolean) => {
        if (!open) closeReservationDialog();
    };

    const {
        canManage,
        cancelError,
        cancelReservation,
        event,
        formError,
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
    } = useBookingReservationEditor({ dialogState, onOpenChange });

    if (!dialogState) return null;

    if (isMissingReservation) {
        return (
            <Dialog key={resetKey} open onOpenChange={handleDialogOpenChange}>
                <DialogContent className="scrollbar-thin max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-none border border-(--hairline) bg-(--surface-01) text-(--bone) shadow-[0_40px_80px_rgba(0,0,0,0.6)] sm:max-w-md">
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
                    "scrollbar-thin max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-none border border-(--hairline) bg-(--surface-01) text-(--bone) shadow-[0_40px_80px_rgba(0,0,0,0.6)]",
                    widthClass,
                )}
            >
                {isDetailsMode && event ? (
                    <BookingReservationDetails
                        canManage={canManage}
                        cancelError={cancelError}
                        event={event}
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
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};
