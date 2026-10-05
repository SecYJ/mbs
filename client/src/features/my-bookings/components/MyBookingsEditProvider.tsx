import { createContext, type ReactNode, use, useState } from "react";
import invariant from "tiny-invariant";
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

function createMyBookingsEditStore() {
    return createStore<MyBookingsEditState>()((set) => ({
        editingBooking: null,
        actions: {
            requestEdit: (booking) => set({ editingBooking: booking }),
            closeEdit: () => set({ editingBooking: null }),
        },
    }));
}

const MyBookingsEditContext = createContext<MyBookingsEditStore | null>(null);

export function MyBookingsEditProvider({ children }: { children: ReactNode }) {
    const [store] = useState(createMyBookingsEditStore);

    return <MyBookingsEditContext value={store}>{children}</MyBookingsEditContext>;
}

export function useMyBookingsEdit<T>(selector: (state: MyBookingsEditState) => T) {
    const store = use(MyBookingsEditContext);

    invariant(store, "useMyBookingsEdit must be used within MyBookingsEditProvider");

    return useStore(store, selector);
}
