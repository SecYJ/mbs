import { useMutationState } from "@tanstack/react-query";
import { ArrowRight, Save } from "lucide-react";

import { bookingMutations } from "@/features/bookings/services/mutations";
import { useBookingCalendarStore } from "@/features/bookings/stores/BookingCalendarStore";

export const ReservationFormActions = ({ submitDisabled }: { submitDisabled: boolean }) => {
    const isExistingBooking = useBookingCalendarStore((state) => state.activeReservationDialog?.mode === "view");
    const { closeReservation, onReservationEditing } = useBookingCalendarStore((state) => state.actions);

    const isSubmitting =
        useMutationState({
            filters: {
                mutationKey: isExistingBooking
                    ? bookingMutations.update().mutationKey
                    : bookingMutations.create().mutationKey,
                status: "pending",
            },
        }).length > 0;

    const onCancel = isExistingBooking ? () => onReservationEditing(false) : closeReservation;
    const submitLabel = isExistingBooking ? (isSubmitting ? "Saving" : "Save") : isSubmitting ? "Reserving" : "Reserve";

    return (
        <div className="flex gap-3 border-t border-(--hairline) pt-5">
            <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 cursor-pointer border border-(--hairline) py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] text-(--bone-muted) uppercase transition-all hover:border-(--hairline-strong) hover:text-(--bone) disabled:cursor-not-allowed disabled:opacity-50"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isSubmitting || submitDisabled}
                className="group flex flex-1 cursor-pointer items-center justify-center gap-2 border border-(--bone) bg-(--bone) py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] text-black uppercase transition-all hover:bg-white hover:tracking-[0.32em] disabled:cursor-wait disabled:opacity-70"
            >
                <span>{submitLabel}</span>
                {isExistingBooking ? (
                    <Save className="size-4" strokeWidth={1.6} />
                ) : (
                    <ArrowRight
                        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                        strokeWidth={1.6}
                    />
                )}
            </button>
        </div>
    );
};
