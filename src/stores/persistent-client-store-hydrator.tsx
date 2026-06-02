import { useEffect } from "react";

import { usePersistentClientStore } from "@/stores/persistent-client-store";

export const PersistentClientStoreHydrator = () => {
    useEffect(() => {
        if (usePersistentClientStore.persist.hasHydrated()) return;

        void usePersistentClientStore.persist.rehydrate();
    }, []);

    return null;
};
