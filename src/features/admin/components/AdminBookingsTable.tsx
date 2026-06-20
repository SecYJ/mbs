import { CalendarDays, Check } from "lucide-react";
import { FormProvider } from "react-hook-form";

import { adminBadgeClasses, adminConfirmClasses, adminInputClasses } from "@/features/admin/admin-classes";
import { EmptyState } from "@/features/admin/components/EmptyState";
import { useAdminBookingsPage } from "@/features/admin/hooks/useAdminBookingsPage";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    upcoming: { bg: "var(--a-info-subtle)", color: "var(--a-info)", label: "Upcoming" },
    "in-progress": { bg: "var(--a-accent-subtle)", color: "var(--a-accent)", label: "In Progress" },
    completed: { bg: "var(--a-surface-2)", color: "var(--a-text-muted)", label: "Completed" },
    cancelled: { bg: "var(--a-danger-subtle)", color: "var(--a-danger)", label: "Cancelled" },
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
                            <th style={{ width: "12%" }}>Date</th>
                            <th style={{ width: "10%" }}>Time</th>
                            <th style={{ width: "20%" }}>Title</th>
                            <th style={{ width: "14%" }}>Room</th>
                            <th style={{ width: "14%" }}>Booked By</th>
                            <th style={{ width: "8%" }}>Attendees</th>
                            <th style={{ width: "10%" }}>Status</th>
                            <th style={{ width: "12%" }}>Actions</th>
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
                                    <td className="tabular-nums" style={{ color: "var(--a-text-secondary)" }}>
                                        {booking.date}
                                    </td>
                                    <td className="tabular-nums" style={{ color: "var(--a-text-secondary)" }}>
                                        {booking.time}
                                    </td>
                                    <td>
                                        <span className="font-medium" style={{ color: "var(--a-text)" }}>
                                            {booking.title}
                                        </span>
                                    </td>
                                    <td style={{ color: "var(--a-text-secondary)" }}>{booking.room}</td>
                                    <td style={{ color: "var(--a-text-secondary)" }}>{booking.bookedBy}</td>
                                    <td className="tabular-nums" style={{ color: "var(--a-text-muted)" }}>
                                        {booking.attendees}
                                    </td>
                                    <td>
                                        <span
                                            className={adminBadgeClasses}
                                            style={{
                                                background: st.bg,
                                                color: st.color,
                                            }}
                                        >
                                            {st.label}
                                        </span>
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
                                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.6875rem] font-medium transition-colors disabled:opacity-60"
                                                        style={{
                                                            background: "var(--a-danger-subtle)",
                                                            color: "var(--a-danger)",
                                                        }}
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
                                                        className="rounded-md px-2 py-1 text-[0.6875rem] font-medium disabled:opacity-60"
                                                        style={{
                                                            color: "var(--a-text-muted)",
                                                        }}
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
                                                        !cannotCancel && "hover:underline",
                                                    )}
                                                    style={{
                                                        color: cannotCancel ? "var(--a-text-muted)" : "var(--a-danger)",
                                                    }}
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
