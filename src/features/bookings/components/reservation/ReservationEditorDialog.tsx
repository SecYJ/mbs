import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReservationDetails } from "@/features/bookings/components/reservation/ReservationDetails";
import {
    LazyReservationForm,
    ReservationFormFallback,
} from "@/features/bookings/components/reservation/ReservationForm.lazy";
import { useBookingCalendarStore } from "@/features/bookings/stores/BookingCalendarStore";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

const dialogContentClassName =
    "scrollbar-thin max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-none border border-(--hairline) bg-(--surface-01) text-(--bone) shadow-[0_40px_80px_rgba(0,0,0,0.6)]";

export const ReservationEditorDialog = () => {
    const isDialogVisible = useBookingCalendarStore((s) => s.activeReservationDialog !== null);
    const { closeReservation } = useBookingCalendarStore((s) => s.actions);

    return (
        <Dialog
            open={isDialogVisible}
            onOpenChange={(open) => {
                if (!open) closeReservation();
            }}
        >
            <ReservationEditorContent />
        </Dialog>
    );
};

const ReservationEditorContent = () => {
    const dialogState = useBookingCalendarStore((s) => s.activeReservationDialog);

    if (!dialogState) {
        return null;
    }

    if (dialogState.mode === "create") {
        return (
            <DialogContent className={cn(dialogContentClassName, "sm:max-w-lg")}>
                <Suspense fallback={<ReservationFormFallback />}>
                    <LazyReservationForm />
                </Suspense>
            </DialogContent>
        );
    }

    return (
        <DialogContent className={cn(dialogContentClassName, dialogState.isEditing ? "sm:max-w-lg" : "sm:max-w-md")}>
            <ReservationDetails
                key={dialogState.event.id ? String(dialogState.event.id) : "unknown"}
                dialogState={dialogState}
            />
        </DialogContent>
    );
};
