import type { SearchMiddleware } from "@tanstack/react-router";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const isSearchValueEqual = (left: unknown, right: unknown): boolean => {
    if (Object.is(left, right)) return true;

    if (Array.isArray(left) && Array.isArray(right)) {
        return left.length === right.length && left.every((value, index) => isSearchValueEqual(value, right[index]));
    }

    if (isPlainObject(left) && isPlainObject(right)) {
        const leftKeys = Object.keys(left);
        const rightKeys = Object.keys(right);
        return (
            leftKeys.length === rightKeys.length &&
            leftKeys.every((key) => Object.hasOwn(right, key) && isSearchValueEqual(left[key], right[key]))
        );
    }

    return false;
};

export const stripDefaultSearchParams =
    <TSearchSchema = Record<string, unknown>>(
        defaults: Record<string, unknown> | null | undefined,
    ): SearchMiddleware<TSearchSchema> =>
    ({ search, next }) => {
        const result = { ...next(search) } as Record<string, unknown>;
        if (!isPlainObject(defaults)) return result as TSearchSchema;

        for (const [key, value] of Object.entries(defaults)) {
            if (isSearchValueEqual(result[key], value)) {
                delete result[key];
            }
        }

        return result as TSearchSchema;
    };
