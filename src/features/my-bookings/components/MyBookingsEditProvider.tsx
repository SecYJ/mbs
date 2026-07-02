import { createContext, type ReactNode, use, useState } from "react";
import { createStore, useStore } from "zustand";

import type { BookingHistoryItem } from "@/features/my-bookings/my-bookings.constants";

type MyBookingsEditState = {
    editingBooking: BookingHistoryItem | null;
    actions: {
        requestEdit: (booking: BookingHistoryItem) => void;
        closeEdit: () => void;
    };
};

type MyBookingsEditStore = ReturnType<typeof createMyBookingsEditStore>;

const createMyBookingsEditStore = () =>
    createStore<MyBookingsEditState>()((set) => ({
        editingBooking: null,
        actions: {
            requestEdit: (booking) => set({ editingBooking: booking }),
            closeEdit: () => set({ editingBooking: null }),
        },
    }));

const MyBookingsEditContext = createContext<MyBookingsEditStore | null>(null);

export const MyBookingsEditProvider = ({ children }: { children: ReactNode }) => {
    const [store] = useState(createMyBookingsEditStore);

    return <MyBookingsEditContext value={store}>{children}</MyBookingsEditContext>;
};

export const useMyBookingsEdit = <T,>(selector: (state: MyBookingsEditState) => T) => {
    const store = use(MyBookingsEditContext);

    if (!store) throw new Error("MyBookingsEditProvider is being used outside of MyBookingsEditContext");

    return useStore(store, selector);
};
