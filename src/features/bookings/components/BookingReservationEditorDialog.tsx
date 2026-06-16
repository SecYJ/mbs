import { useShallow } from "zustand/shallow";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BookingReservationDetails } from "@/features/bookings/components/BookingReservationDetails";
import { BookingReservationForm } from "@/features/bookings/components/BookingReservationForm";
import { useBookingCalendarStore } from "@/features/bookings/stores/BookingCalendarStore";
import { cn } from "@/lib/utils";

const dialogContentClassName =
    "scrollbar-thin max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-none border border-(--hairline) bg-(--surface-01) text-(--bone) shadow-[0_40px_80px_rgba(0,0,0,0.6)]";

// Thin shell: owns the open/close wiring and picks the mode. Each mode reads
// the store itself, so queries and form state only live while that mode is on
// screen and reset automatically when the dialog closes.
export const BookingReservationEditorDialog = () => {
    const [dialogState, { closeReservationDialog }] = useBookingCalendarStore(
        useShallow((state) => [state.activeReservationDialog, state.actions]),
    );

    const isDialogVisible = dialogState !== null;

    return (
        <Dialog
            open={isDialogVisible}
            onOpenChange={(open) => {
                if (!open) closeReservationDialog();
            }}
        >
            {dialogState?.mode === "create" ? (
                <DialogContent className={cn(dialogContentClassName, "sm:max-w-lg")}>
                    <BookingReservationForm initialDetails={dialogState.initialDetails} />
                </DialogContent>
            ) : dialogState?.mode === "view" ? (
                <DialogContent
                    className={cn(dialogContentClassName, dialogState.isEditing ? "sm:max-w-lg" : "sm:max-w-md")}
                >
                    <BookingReservationDetails key={dialogState.event.id ? String(dialogState.event.id) : "unknown"} />
                </DialogContent>
            ) : null}
        </Dialog>
    );
};
