import { Suspense } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EditBookingForm } from "@/features/my-bookings/components/EditBookingForm";
import { useMyBookingsEdit } from "@/features/my-bookings/components/MyBookingsEditProvider";

export function EditBookingDialog() {
    const booking = useMyBookingsEdit((state) => state.editingBooking);
    const { closeEdit } = useMyBookingsEdit((state) => state.actions);

    return (
        <Dialog
            open={booking !== null}
            onOpenChange={(open) => {
                if (!open) closeEdit();
            }}
        >
            {booking ? (
                <DialogContent className="max-h-[calc(100dvh-4rem)] w-full scrollbar-thin overflow-y-auto rounded-none border border-(--hairline) bg-(--surface-01) text-(--bone) shadow-[0_40px_80px_rgba(0,0,0,0.6)] sm:max-w-lg">
                    <Suspense
                        fallback={
                            <div className="flex min-h-64 items-center justify-center text-[0.75rem] tracking-[0.24em] text-(--bone-dim) uppercase">
                                Loading editor…
                            </div>
                        }
                    >
                        <EditBookingForm booking={booking} onCancel={closeEdit} />
                    </Suspense>
                </DialogContent>
            ) : null}
        </Dialog>
    );
}
