import { useShallow } from "zustand/shallow";

import { EditBookingForm } from "@/features/my-bookings/components/EditBookingForm";
import { useMyBookingsEdit } from "@/features/my-bookings/components/MyBookingsEditProvider";

export const EditBookingFormController = () => {
    const [booking, { closeEdit }] = useMyBookingsEdit(useShallow((state) => [state.editingBooking, state.actions]));

    if (!booking) {
        return null;
    }

    return <EditBookingForm booking={booking} onCancel={closeEdit} />;
};
