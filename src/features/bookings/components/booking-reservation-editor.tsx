import type { ReactNode } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BookingReservationDetails } from "@/features/bookings/components/booking-reservation-details";
import { BOOKING_RESERVATION_DIALOG_CLASS } from "@/features/bookings/components/booking-reservation-editor.constants";
import type { BookingReservationEditorControls } from "@/features/bookings/components/booking-reservation-editor.types";
import { BookingReservationForm } from "@/features/bookings/components/booking-reservation-form";
import { useBookingReservationEditor } from "@/features/bookings/hooks/useBookingReservationEditor";

interface BookingReservationEditorProps {
    children: (controls: BookingReservationEditorControls) => ReactNode;
    onClose?: () => void;
}

export const BookingReservationEditor = ({ children, onClose }: BookingReservationEditorProps) => {
    const reservationEditor = useBookingReservationEditor({ onClose });

    return (
        <>
            {children(reservationEditor.controls)}
            <BookingReservationEditorDialog key={reservationEditor.dialog.resetKey} {...reservationEditor.dialog} />
        </>
    );
};

type BookingReservationEditorDialogProps = ReturnType<typeof useBookingReservationEditor>["dialog"];

const BookingReservationEditorDialog = ({
    canManage,
    cancelError,
    cancelReservation,
    currentUserId,
    error,
    event,
    isCancelling,
    isEditingReservation,
    isSubmitting,
    isUnavailable,
    isViewingDetails,
    onCancelForm,
    onOpenChange,
    onStartEditing,
    onSubmit,
    open,
    prefill,
    rooms,
    selectedRoom,
    users,
    widthClass,
}: BookingReservationEditorDialogProps) => {
    if (!open) {
        return <Dialog open={open} onOpenChange={onOpenChange} />;
    }

    if (isUnavailable) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={`${BOOKING_RESERVATION_DIALOG_CLASS} sm:max-w-md`}>
                    <div>
                        <p className="eyebrow eyebrow-gold">Reservation</p>
                        <h2 className="display-italic mt-2 text-[1.75rem] leading-[1.05] font-normal text-(--bone)">
                            Reservation unavailable.
                        </h2>
                        <p className="mt-2 text-[0.78rem] text-(--bone-muted)">
                            This booking could not be found in the current calendar data.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`${BOOKING_RESERVATION_DIALOG_CLASS} ${widthClass}`}>
                {isViewingDetails && event ? (
                    <BookingReservationDetails
                        canManage={canManage}
                        cancelError={cancelError}
                        event={event}
                        isCancelling={isCancelling}
                        onCancelBooking={cancelReservation}
                        onEdit={onStartEditing}
                        selectedRoom={selectedRoom}
                    />
                ) : (
                    <BookingReservationForm
                        currentUserId={currentUserId}
                        error={error}
                        event={event}
                        isEditing={isEditingReservation}
                        isSubmitting={isSubmitting}
                        onCancel={onCancelForm}
                        onSubmit={onSubmit}
                        prefill={prefill}
                        rooms={rooms}
                        users={users}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};
