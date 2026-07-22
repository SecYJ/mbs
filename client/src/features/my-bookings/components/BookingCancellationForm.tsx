import { Ban } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { BookingCancellationFormValues } from "@/features/my-bookings/components/MyBookingsFormProvider";

export const BookingCancellationForm = ({
    cancelErrorMessage,
    isCancellingBooking,
    onClearCancel,
    onSubmitCancel,
}: {
    cancelErrorMessage: string | null;
    isCancellingBooking: boolean;
    onClearCancel: () => void;
    onSubmitCancel: () => void;
}) => {
    const {
        formState: { errors },
        register,
    } = useFormContext<BookingCancellationFormValues>();
    const cancelMessage = errors.reason?.message ?? cancelErrorMessage;

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmitCancel();
            }}
            className="mt-5 space-y-3 border border-red-300/30 bg-red-500/10 p-4"
        >
            <div>
                <p className="text-sm font-semibold text-red-100">Cancel this booking?</p>
                <p className="mt-1 text-xs leading-5 text-red-100/70">
                    Attendees will be notified and the booking will stay visible in history.
                </p>
            </div>
            <textarea
                aria-label="Cancellation reason"
                rows={3}
                placeholder="Reason (optional)"
                className="w-full resize-none border border-red-300/30 bg-black/20 px-3 py-2 text-sm text-red-50 outline-none placeholder:text-red-100/35 focus:border-red-200"
                {...register("reason")}
            />
            {cancelMessage ? <p className="text-xs text-red-100">{cancelMessage}</p> : null}
            <div className="flex flex-wrap justify-end gap-3">
                <button
                    type="button"
                    onClick={onClearCancel}
                    disabled={isCancellingBooking}
                    className="min-h-9 cursor-pointer border border-red-100/20 px-4 text-[0.62rem] font-semibold tracking-[0.24em] text-red-100/70 uppercase transition-colors hover:border-red-100/40 hover:text-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Keep
                </button>
                <button
                    type="submit"
                    disabled={isCancellingBooking}
                    className="inline-flex min-h-9 cursor-pointer items-center gap-2 border border-red-200/70 bg-red-500/20 px-4 text-[0.62rem] font-semibold tracking-[0.24em] text-red-50 uppercase transition-colors hover:bg-red-500/30 disabled:cursor-wait disabled:opacity-60"
                >
                    <Ban className="size-3.5" strokeWidth={1.5} />
                    <span>{isCancellingBooking ? "Cancelling" : "Confirm"}</span>
                </button>
            </div>
        </form>
    );
};
