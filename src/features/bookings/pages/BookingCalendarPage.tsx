import { BookingCalendarAvailability } from "@/features/bookings/components/BookingCalendarAvailability";
import { BookingCalendarControls } from "@/features/bookings/components/BookingCalendarControls";
import { BookingNewReservationButton } from "@/features/bookings/components/BookingNewReservationButton";
import { BookingReservationEditorDialog } from "@/features/bookings/components/BookingReservationEditorDialog";
import { BookingCalendarSummary } from "@/features/bookings/components/BookingCalendarSummary";
import { BookingCalendarStoreProvider } from "@/features/bookings/stores/BookingCalendarStore";

export const BookingCalendarPage = () => (
    <BookingCalendarStoreProvider>
        <div className="space-y-6">
            <header
                className="relative border-b border-(--hairline) pb-5"
                style={{ animation: "fade-up 700ms cubic-bezier(0.16,1,0.3,1) 100ms both" }}
            >
                <div className="grid gap-5 xl:grid-cols-[minmax(240px,0.9fr)_minmax(460px,1.35fr)_auto] xl:items-center">
                    <div>
                        <p className="eyebrow text-(--gold)">Concierge &middot; Today</p>
                        <h1 className="mt-2 display-italic text-[clamp(2rem,3vw,2.8rem)] leading-none tracking-[-0.02em] text-(--bone)">
                            Room Bookings
                        </h1>
                    </div>

                    <BookingCalendarSummary />
                    <BookingNewReservationButton />
                </div>
            </header>

            <BookingCalendarControls />
            <BookingCalendarAvailability />
        </div>

        <BookingReservationEditorDialog />
    </BookingCalendarStoreProvider>
);
