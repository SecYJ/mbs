"use client";

import { useEffect } from "react";
import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const PERSISTENT_CLIENT_STORE_STORAGE_KEY = "mts:client-store";

type UserPreferences = {
    soundEnabled: boolean;
};

const defaultUserPreferences: UserPreferences = {
    soundEnabled: true,
};

const persistedClientStateSchema = z
    .object({
        userPreferences: z
            .object({
                soundEnabled: z.boolean().catch(defaultUserPreferences.soundEnabled),
            })
            .catch(defaultUserPreferences),
    })
    .catch({
        userPreferences: defaultUserPreferences,
    });

type PersistentClientState = {
    userPreferences: UserPreferences;
    actions: {
        updateUserPreferences: (updater: (current: UserPreferences) => UserPreferences) => void;
    };
};

const mergePersistentClientState = (persistedState: unknown, currentState: PersistentClientState) => {
    const parsedState = persistedClientStateSchema.parse(persistedState);

    return {
        ...currentState,
        ...parsedState,
    };
};

export const usePersistentClientStore = create<PersistentClientState>()(
    persist(
        (set) => ({
            userPreferences: defaultUserPreferences,
            actions: {
                updateUserPreferences: (updater) => {
                    set((state) => ({
                        userPreferences: updater(state.userPreferences),
                    }));
                },
            },
        }),
        {
            name: PERSISTENT_CLIENT_STORE_STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ userPreferences: state.userPreferences }),
            merge: mergePersistentClientState,
            skipHydration: true,
        },
    ),
);

export const PersistentClientStoreHydrator = () => {
    useEffect(() => {
        void usePersistentClientStore.persist.rehydrate();
    }, []);

    return null;
};
