import { createContext, use, useState, type ReactNode } from "react";
import { createStore, useStore } from "zustand";

type EquipmentCreateState = {
    open: boolean;
    actions: {
        setOpen: (open: boolean) => void;
    };
};

const createScopedStore = () =>
    createStore<EquipmentCreateState>((set) => ({
        open: false,
        actions: {
            setOpen: (open) => set({ open }),
        },
    }));

type Store = ReturnType<typeof createScopedStore>;

const Ctx = createContext<Store | null>(null);

export const EquipmentCreateStoreProvider = ({ children }: { children: ReactNode }) => {
    const [store] = useState(createScopedStore);

    return <Ctx value={store}>{children}</Ctx>;
};

export const useEquipmentCreateStore = <T,>(selector: (state: EquipmentCreateState) => T) => {
    const store = use(Ctx);

    if (!store) throw new Error("useEquipmentCreateStore must be used within EquipmentCreateStoreProvider");

    return useStore(store, selector);
};
