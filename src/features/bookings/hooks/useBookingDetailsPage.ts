import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { compareAsc, format, formatDuration, intervalToDuration } from "date-fns";

import { rsvpBookingInviteFn } from "@/features/bookings/services/fns";
import { bookingCalendarQueryOptions, bookingDetailsQueryOptions } from "@/features/bookings/services/queries";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";

type BookingStateInput = {
    start: string;
    end: string;
    status: "active" | "cancelled";
};

const getBookingState = (booking: BookingStateInput) => {
    if (booking.status === "cancelled") {
        return {
            label: "Cancelled",
            className: "border-red-300/40 bg-red-500/10 text-red-100",
        };
    }

    const now = new Date();

    if (compareAsc(booking.end, now) <= 0) {
        return {
            label: "Completed",
            className: "border-(--hairline) bg-(--surface-02) text-(--bone-muted)",
        };
    }

    if (compareAsc(booking.start, now) <= 0 && compareAsc(now, booking.end) < 0) {
        return {
            label: "In Session",
            className: "border-(--signal)/40 bg-(--signal)/10 text-(--signal)",
        };
    }

    return {
        label: "Upcoming",
        className: "border-(--gold)/40 bg-(--gold-wash) text-(--gold)",
    };
};

export const useBookingDetailsPage = () => {
    const { bookingId } = useParams({ from: "/_bookings/bookings_/$bookingId" });
    const { data } = useSuspenseQuery(bookingDetailsQueryOptions(bookingId));
    const queryClient = useQueryClient();
    const rsvpBookingInvite = useServerFn(rsvpBookingInviteFn);

    const rsvpMutation = useMutation({
        mutationFn: rsvpBookingInvite,
        onSuccess: () => {
            queryClient.invalidateQueries(bookingDetailsQueryOptions(bookingId));
            queryClient.invalidateQueries(bookingCalendarQueryOptions());
            queryClient.invalidateQueries(notificationsQueryOptions());
        },
    });

    const attendanceStatus = data.currentUserAttendance?.status ?? null;
    const responseCounts = data.attendees.reduce(
        (counts, attendee) => {
            counts[attendee.status] += 1;
            return counts;
        },
        {
            accepted: 0,
            declined: 0,
            pending: 0,
        },
    );
    const bookingDuration =
        formatDuration(intervalToDuration({ start: data.booking.start, end: data.booking.end }), {
            format: ["hours", "minutes"],
        }) || "0 minutes";
    const cancellation =
        data.booking.status === "cancelled"
            ? {
                  summary: [
                      "Cancelled",
                      data.booking.cancelledAt ? format(data.booking.cancelledAt, "MMM d, yyyy") : null,
                      data.cancelledBy ? `by ${data.cancelledBy.name}` : null,
                  ]
                      .filter(Boolean)
                      .join(" "),
                  reason: data.booking.cancelReason || null,
              }
            : null;
    const rsvpError = rsvpMutation.error instanceof Error ? rsvpMutation.error.message : null;

    const respondToInvite = (status: "accepted" | "declined") => {
        rsvpMutation.mutate({ data: { bookingId, status } });
    };

    return {
        acceptInvite: () => respondToInvite("accepted"),
        attendees: data.attendees.map((attendee) => ({
            ...attendee,
            current: attendee.id === data.currentUserId,
        })),
        attendanceStatus,
        booking: data.booking,
        bookingDate: format(data.booking.start, "EEEE, MMMM d, yyyy"),
        bookingDuration,
        bookingState: getBookingState(data.booking),
        bookingTime: `${format(data.booking.start, "HH:mm")} - ${format(data.booking.end, "HH:mm")}`,
        canRespond: data.canRespond,
        cancellation,
        declineInvite: () => respondToInvite("declined"),
        isOrganizer: data.isOrganizer,
        isRsvpPending: rsvpMutation.isPending,
        organizer: data.organizer,
        pageLabel: data.currentUserAttendance ? "Booking Invite" : "Booking Details",
        responseCounts,
        room: data.room,
        roomSummary: `${data.room.location} - ${data.room.capacity} people`,
        rsvpError,
    };
};
