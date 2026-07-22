import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useImmer } from "use-immer";

import { useBookingCalendarEventsContext } from "@/features/bookings/contexts/BookingCalendarEventsContext";
import { cancelBookingFn } from "@/features/bookings/services/fns";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";
import type { ReservationViewState } from "@/features/bookings/types/reservation-editor.types";
import { notificationQueries } from "@/features/notifications/services/queries";

type Props = {
    dialogState: ReservationViewState;
    closeReservation: () => void;
};

export const useReservationView = ({ dialogState, closeReservation }: Props) => {
    const [cancel, setCancel] = useImmer({
        visible: false,
        reason: "",
    });

    const calendarEvents = useBookingCalendarEventsContext();

    const cancelBooking = useServerFn(cancelBookingFn);

    const cancelBookingMutation = useMutation({
        mutationFn: cancelBooking,
        onSuccess: async (_data, _variables, _onMutateResult, context) => {
            await Promise.all([
                context.client.invalidateQueries(bookingCalendarQueries.data()),
                context.client.invalidateQueries(notificationQueries.list()),
            ]);

            closeReservation();
        },
    });

    // dialogState.event is the FullCalendar event captured when the dialog
    // opened. Prefer the same booking re-read from the latest query data; fall
    // back to the snapshot while the query catches up.
    const snapshotEvent = dialogState.event;

    const eventBookingId = snapshotEvent.id;

    const event =
        (eventBookingId ? calendarEvents.find((booking) => booking.id === eventBookingId) : null) ?? snapshotEvent;

    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    const roomId = event.resourceId;
    const reservation = event.extendedProps;

    const { data: selectedRoom } = useSuspenseQuery({
        ...bookingCalendarQueries.data(),
        select: ({ rooms }) => rooms.find((r) => r.id === roomId),
    });

    const canManage = event.extendedProps.canManage;

    const confirmCancelBooking = (cancelReason?: string) => {
        if (!eventBookingId || cancelBookingMutation.isPending) return;

        cancelBookingMutation.mutate({ data: { bookingId: eventBookingId, cancelReason } });
    };

    const organizer = reservation.organizer || "Unknown";

    const requestCancelBooking = () => {
        if (!event.id || cancelBookingMutation.isPending) return;

        setCancel((s) => {
            s.visible = true;
            s.reason = "";
        });
    };

    return {
        canManage,
        cancelError: cancelBookingMutation.error instanceof Error ? cancelBookingMutation.error.message : null,
        startDate,
        endDate,
        isCancelling: cancelBookingMutation.isPending,
        confirmCancelBooking,
        reservation,
        selectedRoom,
        organizer,
        requestCancelBooking,
        cancel,
        setCancel,
        eventTitle: event.title,
    };
};
