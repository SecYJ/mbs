import { useState } from "react";
import { Users, X } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { BookingAttendeePickerDialog } from "@/features/bookings/components/booking-attendee-picker-dialog";
import type { BookableUser } from "@/features/bookings/components/booking-reservation-editor.types";
import type { BookingReservationFormValues } from "@/features/bookings/hooks/useBookingReservationForm";

export const BookingReservationAttendees = ({
    inviteableUsers,
    useUrlBackedSearch = true,
}: {
    inviteableUsers: BookableUser[];
    useUrlBackedSearch?: boolean;
}) => {
    const { control, setValue } = useFormContext<BookingReservationFormValues>();
    const [attendeePickerOpen, setAttendeePickerOpen] = useState(false);
    const selectedIds = useWatch({ control, name: "attendeeIds" });
    const selectedAttendees = inviteableUsers.filter((user) => selectedIds.includes(user.id));

    const openAttendeePicker = () => {
        setValue("draftAttendeeIds", selectedIds);
        setAttendeePickerOpen(true);
    };

    const removeAttendee = (userId: string) => {
        setValue(
            "attendeeIds",
            selectedIds.filter((id) => id !== userId),
        );
    };

    return (
        <div className="space-y-2">
            <Label className="eyebrow block">Attendees</Label>
            <button
                type="button"
                onClick={openAttendeePicker}
                className="flex h-10 w-full cursor-pointer items-center justify-between border border-(--hairline) bg-(--surface-02) px-3 text-left transition-all hover:border-(--hairline-strong)"
            >
                <span className="flex items-center gap-3">
                    <Users className="size-4 text-(--bone-dim)" strokeWidth={1.5} />
                    <span className="text-[0.86rem] text-(--bone)">Invite attendees</span>
                </span>
                <span className="tabular-num text-[0.64rem] font-semibold tracking-[0.24em] text-(--bone-dim) uppercase">
                    {selectedAttendees.length === 0 ? "None" : `${selectedAttendees.length} selected`}
                </span>
            </button>
            {selectedAttendees.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                    {selectedAttendees.map((attendee) => (
                        <span
                            key={attendee.id}
                            className="inline-flex items-center gap-1 border border-(--hairline) bg-(--surface-02) px-2 py-0.5 text-[0.7rem] text-(--bone-muted)"
                        >
                            {attendee.name}
                            <button
                                type="button"
                                onClick={() => removeAttendee(attendee.id)}
                                aria-label={`Remove ${attendee.name}`}
                                className="ml-0.5 cursor-pointer text-(--bone-dim) transition-colors hover:text-(--gold)"
                            >
                                <X className="size-3" strokeWidth={1.6} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            {attendeePickerOpen ? (
                <BookingAttendeePickerDialog
                    inviteableUsers={inviteableUsers}
                    open={attendeePickerOpen}
                    onOpenChange={setAttendeePickerOpen}
                    useUrlBackedSearch={useUrlBackedSearch}
                />
            ) : null}
        </div>
    );
};
