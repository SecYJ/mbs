import type { EventInput } from "@fullcalendar/core";

import type { BookingCalendarData } from "@/features/bookings/services/queries";

export type BookingFormData = {
    title: string;
    roomId: string;
    start: Date;
    end: Date;
    attendeeIds: string[];
    description: string;
};

export type BookingReservationInitialDetails = { roomId?: string; start?: Date; end?: Date };
export type BookingReservationDialogState =
    | { mode: "create"; initialDetails?: BookingReservationInitialDetails }
    | { mode: "view"; event: EventInput };

export type BookingReservationRoom = BookingCalendarData["rooms"][number];
export type BookableUser = BookingCalendarData["users"][number];
