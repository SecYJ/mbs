import { createContext, use, useState, type ReactNode } from "react";
import { createStore, useStore } from "zustand";

type RoomsCreateState = {
    open: boolean;
    actions: {
        setOpen: (open: boolean) => void;
    };
};

const createScopedStore = () =>
    createStore<RoomsCreateState>((set) => ({
        open: false,
        actions: {
            setOpen: (open) => set({ open }),
        },
    }));

type Store = ReturnType<typeof createScopedStore>;

const Ctx = createContext<Store | null>(null);

export const RoomsCreateStoreProvider = ({ children }: { children: ReactNode }) => {
    const [store] = useState(createScopedStore);

    return <Ctx value={store}>{children}</Ctx>;
};

export const useRoomsCreateStore = <T,>(selector: (state: RoomsCreateState) => T) => {
    const store = use(Ctx);

    if (!store) throw new Error("useRoomsCreateStore must be used within RoomsCreateStoreProvider");

    return useStore(store, selector);
};
