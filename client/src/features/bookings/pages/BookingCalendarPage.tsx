import { CalendarControlRenderer } from "@/features/bookings/components/calendar/CalendarControls";
import { CalendarPanel } from "@/features/bookings/components/calendar/CalendarPanel";
import { CalendarSummary } from "@/features/bookings/components/calendar/CalendarSummary";
import { NewReservationButton } from "@/features/bookings/components/reservation/NewReservationButton";
import { ReservationEditorDialog } from "@/features/bookings/components/reservation/ReservationEditorDialog";
import { BookingCalendarEventsProvider } from "@/features/bookings/contexts/BookingCalendarEventsContext";
import { useBookingCalendarEvents } from "@/features/bookings/hooks/useCalendarEvents";
import { BookingCalendarStoreProvider } from "@/features/bookings/stores/BookingCalendarStore";

export const BookingCalendarPage = () => (
    <BookingCalendarStoreProvider>
        <BookingCalendarPageContent />
    </BookingCalendarStoreProvider>
);

const BookingCalendarPageContent = () => {
    const { events } = useBookingCalendarEvents();

    return (
        <BookingCalendarEventsProvider events={events}>
            <div className="space-y-6">
                <header className="animate-fade-up animation-duration-700 relative border-b border-(--hairline) pb-5 [animation-delay:100ms]">
                    <div className="grid gap-5 xl:grid-cols-[minmax(240px,0.9fr)_minmax(460px,1.35fr)_auto] xl:items-center">
                        <div>
                            <p className="eyebrow text-(--gold)">Concierge &middot; Today</p>
                            <h1 className="display-italic mt-2 text-[clamp(2rem,3vw,2.8rem)] leading-none tracking-[-0.02em] text-(--bone)">
                                Room Bookings
                            </h1>
                        </div>

                        <CalendarSummary />
                        <NewReservationButton />
                    </div>
                </header>

                <CalendarControlRenderer />
                <CalendarPanel />
            </div>

            <ReservationEditorDialog />
        </BookingCalendarEventsProvider>
    );
};
