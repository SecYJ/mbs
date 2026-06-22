import type { BookingCalendarEvent } from "@/features/bookings/services/queries";

export type ReservationInitialDetails = {
    roomId: string;
    start?: Date;
    end?: Date;
};

export type ReservationViewState = { mode: "view"; event: BookingCalendarEvent; isEditing: boolean };
type ReservationCreateState = { mode: "create"; initialDetails?: ReservationInitialDetails };

export type ReservationDialogState = ReservationCreateState | ReservationViewState;
