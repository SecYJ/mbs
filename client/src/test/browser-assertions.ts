import { expect } from "vitest";
import type { Locator } from "vitest/browser";

export const expectBrowserVisible = async (locator: Locator) => {
    await expect
        .poll(() => {
            const element = locator.element();
            const styles = getComputedStyle(element);

            return (
                styles.display !== "none" &&
                styles.visibility !== "hidden" &&
                styles.visibility !== "collapse" &&
                element.getBoundingClientRect().height > 0 &&
                element.getBoundingClientRect().width > 0
            );
        })
        .toBe(true);
};

export const expectBrowserAttribute = async (locator: Locator, name: string, value: string) => {
    await expect.poll(() => locator.element().getAttribute(name)).toBe(value);
};
