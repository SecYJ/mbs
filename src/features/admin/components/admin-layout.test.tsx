// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminLayout } from "./admin-layout";
import type { ComponentProps } from "react";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to: _to,
		...props
	}: ComponentProps<"a"> & { to?: string }) => <a {...props}>{children}</a>,
	Outlet: () => <div data-testid="admin-outlet" />,
	useMatches: () => [{ fullPath: "/admin/rooms" }],
}));

describe("AdminLayout", () => {
	it("collapses the sidebar when the toggle is clicked", () => {
		const { container } = render(<AdminLayout />);

		const sidebar = container.querySelector(".admin-sidebar");
		expect(sidebar?.getAttribute("data-collapsed")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

		expect(sidebar?.getAttribute("data-collapsed")).toBe("true");
		expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeTruthy();
	});
});
