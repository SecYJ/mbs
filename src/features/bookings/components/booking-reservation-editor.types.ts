import type { EventInput } from "@fullcalendar/core";

import type { BookingCalendarData } from "@/features/bookings/services/queries";

// The payload shape the create/update booking server fns expect; the form
// maps its values into this once on submit.
export type BookingReservationPayload = {
    title: string;
    roomId: string;
    startTime: string;
    endTime: string;
    attendeeIds: string[];
    description: string;
};

export type BookingReservationInitialDetails = Partial<{ roomId: string; start: Date; end: Date }>;

// Injected into BookingReservationForm when editing an existing booking; the
// update mutation lives in the view flow, not the form. When absent the form
// runs in create mode and owns its submission end to end.
export type BookingReservationEditing = {
    error: string | null;
    event: EventInput;
    isSubmitting: boolean;
    onCancel: () => void;
    onSubmit: (payload: BookingReservationPayload) => void;
};

export type BookingReservationDialogState =
    | { mode: "create"; initialDetails?: BookingReservationInitialDetails }
    | { mode: "view"; event: EventInput; isEditing: boolean };

export type BookingReservationRoom = BookingCalendarData["rooms"][number];

export type BookableUser = BookingCalendarData["users"][number];
