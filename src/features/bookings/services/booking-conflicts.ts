export type BookingConflictDetails = {
    title: string | null;
    roomName: string;
    startTime: Date | string;
    endTime: Date | string;
    canViewDetails?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
});

const toDate = (value: Date | string) => (value instanceof Date ? value : new Date(value));

export const getBookingConflictMessage = ({
    title,
    roomName,
    startTime,
    endTime,
    canViewDetails = true,
}: BookingConflictDetails) => {
    const start = toDate(startTime);
    const end = toDate(endTime);
    const occupiedSlot = `${dateFormatter.format(start)} from ${timeFormatter.format(start)} to ${timeFormatter.format(end)}`;
    const visibleTitle = canViewDetails ? title?.trim() : "";
    const titleContext = visibleTitle ? ` for "${visibleTitle}"` : "";

    return `${roomName} is occupied on ${occupiedSlot}${titleContext}. Choose a different time or room.`;
};
