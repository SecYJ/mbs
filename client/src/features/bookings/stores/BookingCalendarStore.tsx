import type { DatesSetArg } from "@fullcalendar/core";
import type FullCalendar from "@fullcalendar/react";
import { createContext, use, useState, type ReactNode } from "react";
import { createStore, useStore } from "zustand";

import type { BookingCalendarEvent } from "@/features/bookings/services/queries";
import type {
    ReservationDialogState,
    ReservationInitialDetails,
} from "@/features/bookings/types/reservation-editor.types";

type BookingCalendarVisibleRange = {
    activeEnd: Date;
    activeStart: Date;
    title: string;
};

type BookingCalendarState = {
    activeReservationDialog: ReservationDialogState | null;
    calendar: FullCalendar | null;
    visibleRange: BookingCalendarVisibleRange | null;
    actions: {
        closeReservation: () => void;
        openExistingReservation: (event: BookingCalendarEvent) => void;
        openNewReservation: (initialDetails?: ReservationInitialDetails) => void;
        onReservationEditing: (isEditing: boolean) => void;
        setCalendar: (calendar: FullCalendar | null) => void;
        setVisibleRange: (arg: DatesSetArg) => void;
    };
};

const createScopedStore = () =>
    createStore<BookingCalendarState>((set, get) => ({
        activeReservationDialog: null,
        calendar: null,
        visibleRange: null,
        actions: {
            closeReservation: () => {
                set({ activeReservationDialog: null });
            },
            openExistingReservation: (event) => {
                set({ activeReservationDialog: { mode: "view", event, isEditing: false } });
            },
            openNewReservation: (initialDetails) => {
                set({ activeReservationDialog: { mode: "create", initialDetails } });
            },
            onReservationEditing: (isEditing) => {
                const dialog = get().activeReservationDialog;
                if (dialog?.mode !== "view") return;
                set({ activeReservationDialog: { ...dialog, isEditing } });
            },
            setCalendar: (calendar) => {
                if (get().calendar === calendar) return;
                set({ calendar });
            },
            setVisibleRange: (arg) => {
                set({
                    visibleRange: {
                        activeEnd: arg.view.activeEnd,
                        activeStart: arg.view.activeStart,
                        title: arg.view.title,
                    },
                });
            },
        },
    }));

type Store = ReturnType<typeof createScopedStore>;

const Ctx = createContext<Store | null>(null);

export const BookingCalendarStoreProvider = ({ children }: { children: ReactNode }) => {
    const [store] = useState(createScopedStore);

    return <Ctx value={store}>{children}</Ctx>;
};

export const useBookingCalendarStore = <T,>(selector: (state: BookingCalendarState) => T) => {
    const store = use(Ctx);

    if (!store) throw new Error("useBookingCalendarStore must be used within BookingCalendarStoreProvider");

    return useStore(store, selector);
};
