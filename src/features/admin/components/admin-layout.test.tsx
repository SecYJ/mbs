// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminLayout } from "./admin-layout";
import type { ComponentProps } from "react";

vi.mock("@tanstack/react-router", () => ({
    Link: ({ children, to: _to, ...props }: ComponentProps<"a"> & { to?: string }) => <a {...props}>{children}</a>,
    Outlet: () => <div data-testid="admin-outlet" />,
    linkOptions: <T,>(items: T) => items,
    useMatches: () => [{ fullPath: "/admin/rooms" }],
}));

const baseProps = {
    user: { name: "Test User", email: "test@example.com" },
    onSignOut: () => {},
};

describe("AdminLayout", () => {
    it("collapses the sidebar when the toggle is clicked", () => {
        const { container } = render(<AdminLayout {...baseProps} />);

        const sidebar = container.querySelector("aside");
        expect(sidebar?.getAttribute("data-collapsed")).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

        expect(sidebar?.getAttribute("data-collapsed")).toBe("true");
        expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeTruthy();
    });
});
