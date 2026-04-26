export const readCooldownTimestamp = (key: string) => {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const ts = Number(raw);
    if (!Number.isFinite(ts) || ts <= Date.now()) {
        window.sessionStorage.removeItem(key);
        return null;
    }
    return ts;
};

export const writeCooldownTimestamp = (key: string, timestamp: number) => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(key, String(timestamp));
};

export const clearCooldownTimestamp = (key: string) => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(key);
};
