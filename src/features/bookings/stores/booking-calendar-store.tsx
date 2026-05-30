import { createContext, use, useState, type ReactNode } from "react";
import type { DatesSetArg } from "@fullcalendar/core";
import type FullCalendar from "@fullcalendar/react";
import { createStore, useStore } from "zustand";

type BookingCalendarVisibleRange = {
    activeEnd: Date;
    activeStart: Date;
    title: string;
};

type BookingCalendarState = {
    calendar: FullCalendar | null;
    visibleRange: BookingCalendarVisibleRange | null;
    actions: {
        goNext: () => void;
        goPrev: () => void;
        goToday: () => void;
        setCalendar: (calendar: FullCalendar | null) => void;
        setVisibleRange: (arg: DatesSetArg) => void;
        changeView: (viewName: string) => void;
    };
};

const createScopedStore = () =>
    createStore<BookingCalendarState>((set, get) => ({
        calendar: null,
        visibleRange: null,
        actions: {
            goNext: () => get().calendar?.getApi().next(),
            goPrev: () => get().calendar?.getApi().prev(),
            goToday: () => get().calendar?.getApi().today(),
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
            changeView: (viewName) => get().calendar?.getApi().changeView(viewName),
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
