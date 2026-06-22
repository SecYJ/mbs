export type Database = typeof import("@/db").db;

export const getDb = async () => (await import("@/db")).db;
