import type { EventInput } from "@fullcalendar/core";

import type { BookingCalendarData } from "@/features/bookings/services/queries";

export interface BookingFormData {
    title: string;
    roomId: string;
    start: Date;
    end: Date;
    attendeeIds: string[];
    description: string;
}

export type BookingReservationPrefill = { roomId?: string; start?: Date; end?: Date };
export type BookingReservationMode = "create" | "view";

export interface BookingReservationEditorControls {
    openExistingReservation: (event: EventInput) => void;
    openNewReservation: (prefill?: BookingReservationPrefill) => void;
}

export type BookingReservationRoom = BookingCalendarData["rooms"][number];
export type BookableUser = BookingCalendarData["users"][number];
