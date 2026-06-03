import type { BookingCalendarData } from "@/features/bookings/services/queries";

export type BookingHistoryItem = BookingCalendarData["history"][number];

export const myBookingGroups = ["upcoming", "in-progress", "past"] as const;

export type MyBookingGroup = (typeof myBookingGroups)[number];

export const myBookingsSearchDefaults = {
    group: "upcoming" as MyBookingGroup,
    q: "",
};

export const myBookingGroupOptions: Array<{ value: MyBookingGroup; label: string }> = [
    { value: "upcoming", label: "Upcoming" },
    { value: "in-progress", label: "In Session" },
    { value: "past", label: "Past" },
];

export const myBookingSectionMeta: Record<MyBookingGroup, { title: string; description: string }> = {
    upcoming: {
        title: "Upcoming",
        description: "Reservations that have not started yet.",
    },
    "in-progress": {
        title: "In Session",
        description: "Meetings currently in progress.",
    },
    past: {
        title: "Past",
        description: "Completed and cancelled booking records.",
    },
};

export const myBookingStatusMeta: Record<
    BookingHistoryItem["status"],
    {
        label: string;
        className: string;
    }
> = {
    upcoming: {
        label: "Upcoming",
        className: "border-(--gold)/40 bg-(--gold-wash) text-(--gold)",
    },
    "in-progress": {
        label: "In Session",
        className: "border-(--signal)/40 bg-(--signal)/10 text-(--signal)",
    },
    completed: {
        label: "Completed",
        className: "border-(--hairline) bg-(--surface-02) text-(--bone-muted)",
    },
    cancelled: {
        label: "Cancelled",
        className: "border-red-300/40 bg-red-500/10 text-red-100",
    },
};

export const myBookingRsvpMeta: Record<
    NonNullable<BookingHistoryItem["currentUserAttendance"]>["status"],
    {
        label: string;
        className: string;
    }
> = {
    accepted: {
        label: "Accepted",
        className: "border-(--signal)/40 bg-(--signal)/10 text-(--signal)",
    },
    declined: {
        label: "Declined",
        className: "border-red-300/40 bg-red-500/10 text-red-100",
    },
    pending: {
        label: "Pending RSVP",
        className: "border-(--hairline) bg-(--surface-02) text-(--bone-muted)",
    },
};
