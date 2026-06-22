import { CalendarDays, Check } from "lucide-react";
import { FormProvider } from "react-hook-form";

import { adminBadgeClasses, adminConfirmClasses, adminInputClasses } from "@/features/admin/admin-classes";
import { EmptyState } from "@/features/admin/components/EmptyState";
import { useAdminBookingsPage } from "@/features/admin/hooks/useAdminBookingsPage";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { className: string; label: string }> = {
    upcoming: { className: "bg-(--a-info-subtle) text-(--a-info)", label: "Upcoming" },
    "in-progress": { className: "bg-(--a-accent-subtle) text-(--a-accent)", label: "In Progress" },
    completed: { className: "bg-(--a-surface-2) text-(--a-text-muted)", label: "Completed" },
    cancelled: { className: "bg-(--a-danger-subtle) text-(--a-danger)", label: "Cancelled" },
};

export const AdminBookingsTable = () => {
    const {
        beginCancellation,
        bookings,
        cancellationFields,
        form,
        cancellingBookingId,
        dismissCancellation,
        submitCancellation,
    } = useAdminBookingsPage();

    if (bookings.length === 0) {
        return (
            <EmptyState
                icon={CalendarDays}
                title="No bookings found"
                description="No bookings match your current filters."
            />
        );
    }

    return (
        <FormProvider {...form}>
            <div className="overflow-hidden rounded-xl border border-(--a-border-hover) bg-(--a-surface-0)">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th className="w-[12%]">Date</th>
                            <th className="w-1/10">Time</th>
                            <th className="w-1/5">Title</th>
                            <th className="w-[14%]">Room</th>
                            <th className="w-[14%]">Booked By</th>
                            <th className="w-[8%]">Attendees</th>
                            <th className="w-1/10">Status</th>
                            <th className="w-[12%]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => {
                            const st = STATUS_STYLES[booking.status];
                            const cancellationIndex = cancellationFields.findIndex(
                                (cancellation) => cancellation.bookingId === booking.id,
                            );
                            const cannotCancel =
                                !booking.canCancel || booking.status === "cancelled" || booking.status === "completed";
                            const isCancellingBooking = cancellationIndex !== -1 && !cannotCancel;
                            const isSubmittingCancellation = cancellingBookingId === booking.id;

                            return (
                                <tr key={booking.id}>
                                    <td className="text-(--a-text-secondary) tabular-nums">{booking.date}</td>
                                    <td className="text-(--a-text-secondary) tabular-nums">{booking.time}</td>
                                    <td>
                                        <span className="font-medium text-(--a-text)">{booking.title}</span>
                                    </td>
                                    <td className="text-(--a-text-secondary)">{booking.room}</td>
                                    <td className="text-(--a-text-secondary)">{booking.bookedBy}</td>
                                    <td className="text-(--a-text-muted) tabular-nums">{booking.attendees}</td>
                                    <td>
                                        <span className={cn(adminBadgeClasses, st.className)}>{st.label}</span>
                                    </td>
                                    <td>
                                        {isCancellingBooking ? (
                                            <div className={cn(adminConfirmClasses, "space-y-2")}>
                                                <input
                                                    className={cn(adminInputClasses, "w-full")}
                                                    placeholder="Cancellation reason..."
                                                    aria-label="Cancellation reason"
                                                    disabled={isSubmittingCancellation}
                                                    {...form.register(
                                                        `cancellations.${cancellationIndex}.reason` as const,
                                                    )}
                                                />
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => submitCancellation(booking)}
                                                        disabled={isSubmittingCancellation}
                                                        className="inline-flex items-center gap-1 rounded-md bg-(--a-danger-subtle) px-2 py-1 text-[0.6875rem] font-medium text-(--a-danger) transition-colors disabled:opacity-60"
                                                    >
                                                        <Check className="size-3" />
                                                        {isSubmittingCancellation ? "Cancelling..." : "Cancel booking"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isSubmittingCancellation}
                                                        onClick={() => {
                                                            dismissCancellation(booking.id);
                                                        }}
                                                        className="rounded-md px-2 py-1 text-[0.6875rem] font-medium text-(--a-text-muted) disabled:opacity-60"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    aria-label={`Cancel ${booking.title}`}
                                                    title="Cancel booking"
                                                    disabled={cannotCancel}
                                                    onClick={() => {
                                                        beginCancellation(booking.id);
                                                    }}
                                                    className={cn(
                                                        "text-[0.75rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                                                        cannotCancel ? "text-(--a-text-muted)" : "text-(--a-danger)",
                                                        !cannotCancel && "hover:underline",
                                                    )}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </FormProvider>
    );
};
