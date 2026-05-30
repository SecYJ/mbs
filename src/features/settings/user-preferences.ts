"use client";

import { useEffect, useState } from "react";

const userPreferencesVersion = 1;
const userPreferencesStorageKey = "mts:user-preferences";
const userPreferencesChangeEvent = "mts:user-preferences-change";

type NotificationPreferences = {
    soundEnabled: boolean;
};

export type UserPreferences = {
    version: typeof userPreferencesVersion;
    notifications: NotificationPreferences;
};

declare global {
    interface WindowEventMap {
        "mts:user-preferences-change": CustomEvent<UserPreferences>;
    }
}

export const defaultUserPreferences: UserPreferences = {
    version: userPreferencesVersion,
    notifications: {
        soundEnabled: true,
    },
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const getNotificationPreferences = (value: unknown): NotificationPreferences => {
    if (!isRecord(value)) return defaultUserPreferences.notifications;

    return {
        soundEnabled:
            typeof value.soundEnabled === "boolean"
                ? value.soundEnabled
                : defaultUserPreferences.notifications.soundEnabled,
    };
};

const parseUserPreferences = (value: string | null): UserPreferences => {
    if (!value) return defaultUserPreferences;

    try {
        const parsed = JSON.parse(value);
        if (!isRecord(parsed)) return defaultUserPreferences;

        return {
            version: userPreferencesVersion,
            notifications: getNotificationPreferences(parsed.notifications),
        };
    } catch {
        return defaultUserPreferences;
    }
};

const readUserPreferences = () => {
    if (typeof window === "undefined") return defaultUserPreferences;

    try {
        return parseUserPreferences(window.localStorage.getItem(userPreferencesStorageKey));
    } catch {
        return defaultUserPreferences;
    }
};

const writeUserPreferences = (preferences: UserPreferences) => {
    if (typeof window === "undefined") return;

    try {
        window.localStorage.setItem(userPreferencesStorageKey, JSON.stringify(preferences));
        window.dispatchEvent(new CustomEvent(userPreferencesChangeEvent, { detail: preferences }));
    } catch {
        window.dispatchEvent(new CustomEvent(userPreferencesChangeEvent, { detail: preferences }));
    }
};

export const useUserPreferences = () => {
    const [preferences, setPreferences] = useState(readUserPreferences);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== userPreferencesStorageKey) return;
            setPreferences(parseUserPreferences(event.newValue));
        };

        const handlePreferenceChange = (event: CustomEvent<UserPreferences>) => {
            setPreferences(event.detail);
        };

        window.addEventListener("storage", handleStorage);
        window.addEventListener(userPreferencesChangeEvent, handlePreferenceChange);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener(userPreferencesChangeEvent, handlePreferenceChange);
        };
    }, []);

    const updatePreferences = (updater: (current: UserPreferences) => UserPreferences) => {
        setPreferences((current) => {
            const nextPreferences = updater(current);
            writeUserPreferences(nextPreferences);
            return nextPreferences;
        });
    };

    return {
        preferences,
        updatePreferences,
    };
};
