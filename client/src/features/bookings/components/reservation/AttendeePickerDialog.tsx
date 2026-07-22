import { Suspense } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    AttendeePickerContentFallback,
    LazyAttendeePickerContent,
} from "@/features/bookings/components/reservation/AttendeePickerDialog.lazy";
import { cn } from "@/lib/utils";

type AttendeePickerDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const AttendeePickerDialog = ({ open, onOpenChange }: AttendeePickerDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "rounded-none border border-(--hairline) bg-(--surface-01) text-(--bone) shadow-[0_40px_80px_rgba(0,0,0,0.6)]",
                    "sm:max-w-2xl",
                )}
            >
                <DialogHeader>
                    <p className="eyebrow text-(--gold)">Invite</p>
                    <DialogTitle className="display-italic mt-2 text-[1.75rem] leading-[1.05] font-normal text-(--bone)">
                        Select attendees.
                    </DialogTitle>
                    <DialogDescription className="text-[0.78rem] text-(--bone-muted)">
                        Selected users will be attached when the booking is submitted.
                    </DialogDescription>
                </DialogHeader>

                <Suspense fallback={<AttendeePickerContentFallback />}>
                    <LazyAttendeePickerContent onOpenChange={onOpenChange} />
                </Suspense>
            </DialogContent>
        </Dialog>
    );
};
