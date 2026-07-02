import type { MyBookingsQueryData } from "@/features/my-bookings/services/queries";

export type BookingHistoryItem = MyBookingsQueryData["history"][number];

export const myBookingsSearchDefaults = {
    group: "upcoming" as MyBookingGroupType,
    q: "",
};

export const MY_BOOKING_GROUP_OPTIONS = [
    { value: "upcoming", label: "Upcoming" },
    { value: "in-progress", label: "In Session" },
    { value: "past", label: "Past" },
] as const;

export const MY_BOOKING_GROUPS = MY_BOOKING_GROUP_OPTIONS.map((m) => m.value);

export type MyBookingGroupType = (typeof MY_BOOKING_GROUPS)[number];

export const MY_BOOKING_SECTION_META = {
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
} satisfies Record<string, { title: string; description: string }>;

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
