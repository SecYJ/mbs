type BookingHistoryUser = {
    id: string;
    name: string;
    email: string;
};

type BookingHistoryStatus = "upcoming" | "in-progress" | "completed" | "cancelled";

type BookingHistoryBooking = {
    id: string;
    roomId: string;
    title: string;
    description: string | null;
    startTime: Date | string;
    endTime: Date | string;
    status: "active" | "cancelled";
    cancelledAt: Date | string | null;
    cancelReason: string | null;
};

const toIsoOrNull = (value: Date | string | null) => (value ? new Date(value).toISOString() : null);

const getHistoryStatus = (booking: BookingHistoryBooking, now: Date): BookingHistoryStatus => {
    if (booking.status === "cancelled") return "cancelled";

    const startTime = new Date(booking.startTime).getTime();
    const endTime = new Date(booking.endTime).getTime();
    const nowTime = now.getTime();

    if (endTime <= nowTime) return "completed";
    if (startTime <= nowTime && nowTime < endTime) return "in-progress";
    return "upcoming";
};

export const getBookingHistoryItem = ({
    booking,
    room,
    organizer,
    cancelledBy,
    attendees,
    now = new Date(),
}: {
    booking: BookingHistoryBooking;
    room: {
        name: string;
        location: string;
    };
    organizer: BookingHistoryUser;
    cancelledBy: BookingHistoryUser | null;
    attendees: BookingHistoryUser[];
    now?: Date;
}) => ({
    id: booking.id,
    roomId: booking.roomId,
    title: booking.title,
    description: booking.description ?? "",
    start: new Date(booking.startTime).toISOString(),
    end: new Date(booking.endTime).toISOString(),
    status: getHistoryStatus(booking, now),
    cancelledAt: toIsoOrNull(booking.cancelledAt),
    cancelReason: booking.cancelReason ?? "",
    room,
    organizer,
    cancelledBy,
    attendees,
});
