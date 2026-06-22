import { createContext, use, type ReactNode } from "react";

import type { BookingCalendarEvents } from "@/features/bookings/services/queries";

const BookingCalendarEventsContext = createContext<BookingCalendarEvents | null>(null);

export const BookingCalendarEventsProvider = ({
    children,
    events,
}: {
    children: ReactNode;
    events: BookingCalendarEvents;
}) => <BookingCalendarEventsContext value={events}>{children}</BookingCalendarEventsContext>;

export const useBookingCalendarEventsContext = () => {
    const events = use(BookingCalendarEventsContext);

    if (!events) {
        throw new Error("useBookingCalendarEventsContext must be used within BookingCalendarEventsProvider");
    }

    return events;
};
