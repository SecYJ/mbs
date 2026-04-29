type CancellationNotificationBooking = {
    id: string;
    title: string;
    startTime: Date | string;
    endTime: Date | string;
    roomName: string;
    roomLocation: string;
};

const formatCancellationDate = (value: Date | string) =>
    new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });

const formatCancellationTime = (value: Date | string) =>
    new Date(value).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
    });

const getCancellationMessage = (booking: CancellationNotificationBooking) =>
    `Booking canceled: ${booking.title} in ${booking.roomName}, ${booking.roomLocation} on ${formatCancellationDate(
        booking.startTime,
    )} from ${formatCancellationTime(booking.startTime)} to ${formatCancellationTime(booking.endTime)}`;

export const getBookingCancellationNotificationValues = ({
    attendeeIds,
    booking,
}: {
    attendeeIds: string[];
    booking: CancellationNotificationBooking;
}) =>
    attendeeIds.map((userId) => ({
        bookingId: booking.id,
        userId,
        message: getCancellationMessage(booking),
    }));
