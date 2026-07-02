import { EditBookingForm } from "@/features/my-bookings/components/EditBookingForm";
import { useMyBookingsEdit } from "@/features/my-bookings/components/MyBookingsEditProvider";
import { useShallow } from "zustand/shallow";

export const EditBookingFormController = () => {
    const [booking, { closeEdit }] = useMyBookingsEdit(useShallow((state) => [state.editingBooking, state.actions]));

    if (!booking) {
        return null;
    }

    return <EditBookingForm booking={booking} onCancel={closeEdit} />;
};
