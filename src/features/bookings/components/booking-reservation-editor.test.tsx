// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { BookingReservationEditor } from "./booking-reservation-editor";
import type { BookingReservationPrefill } from "./booking-reservation-editor.types";

type MockUser = {
    id: string;
    name: string;
    email: string;
};

const mocks = vi.hoisted(() => ({
    calendarData: {
        currentUserId: "user-3",
        events: [],
        rooms: [
            {
                id: "room-1",
                title: "Aurora",
                location: "3F East",
                capacity: 8,
                equipment: ["Projector"],
            },
        ],
        users: [
            { id: "user-1", name: "Ada Lovelace", email: "ada@example.com" },
            { id: "user-2", name: "Grace Hopper", email: "grace@example.com" },
            { id: "user-3", name: "Linus Torvalds", email: "linus@example.com" },
        ],
    },
    mutationFlow: {
        cancelBookingReservation: vi.fn(),
        cancelError: null as string | null,
        createError: null as string | null,
        isCancelling: false,
        isSubmitting: false,
        isUpdating: false,
        reset: vi.fn(),
        submitBooking: vi.fn(),
        updateBookingReservation: vi.fn(),
        updateError: null as string | null,
    },
}));

vi.mock("@legendapp/list/react", () => ({
    LegendList: ({
        data,
        extraData,
        renderItem,
        keyExtractor,
        ListEmptyComponent,
    }: {
        data: MockUser[];
        extraData?: unknown;
        renderItem: (props: {
            item: MockUser;
            index: number;
            data: MockUser[];
            extraData: unknown;
            type: undefined;
        }) => ReactNode;
        keyExtractor: (item: MockUser, index: number) => string;
        ListEmptyComponent?: ReactNode;
    }) => (
        <div data-testid="legend-list">
            {data.length === 0
                ? ListEmptyComponent
                : data.map((item, index) => (
                      <div key={keyExtractor(item, index)}>
                          {renderItem({ item, index, data, extraData, type: undefined })}
                      </div>
                  ))}
        </div>
    ),
}));

vi.mock("@tanstack/react-query", () => ({
    useSuspenseQuery: () => ({ data: mocks.calendarData }),
}));

vi.mock("@/features/bookings/services/queries", () => ({
    bookingCalendarQueryOptions: () => ({ queryKey: ["bookings", "calendar"] }),
}));

vi.mock("@/features/bookings/hooks/useBookingMutationFlow", () => ({
    useBookingMutationFlow: () => mocks.mutationFlow,
}));

const basePrefill = {
    roomId: "room-1",
    start: new Date("2099-04-29T09:00:00"),
    end: new Date("2099-04-29T10:00:00"),
};

const renderOpenEditor = (prefill: BookingReservationPrefill = basePrefill) => {
    render(
        <BookingReservationEditor>
            {({ openNewReservation }) => (
                <button type="button" onClick={() => openNewReservation(prefill)}>
                    Open reservation editor
                </button>
            )}
        </BookingReservationEditor>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open reservation editor" }));
};

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mocks.mutationFlow.cancelError = null;
    mocks.mutationFlow.createError = null;
    mocks.mutationFlow.updateError = null;
    mocks.mutationFlow.isCancelling = false;
    mocks.mutationFlow.isSubmitting = false;
    mocks.mutationFlow.isUpdating = false;
});

describe("BookingReservationEditor attendee picker", () => {
    it("shows users before searching, filters them, pins selected users, and discards cancel", () => {
        renderOpenEditor();

        fireEvent.click(screen.getByRole("button", { name: /invite attendees/i }));

        expect(screen.getByText("Ada Lovelace")).toBeTruthy();
        expect(screen.getByText("Grace Hopper")).toBeTruthy();
        expect(screen.queryByText("Linus Torvalds")).toBeNull();

        fireEvent.click(screen.getByRole("checkbox", { name: /ada lovelace/i }));
        expect(screen.getAllByText("Ada Lovelace").length).toBeGreaterThan(1);

        fireEvent.change(screen.getByRole("textbox", { name: "Search users" }), {
            target: { value: "grace" },
        });

        expect(screen.getByText("Ada Lovelace")).toBeTruthy();
        expect(screen.getByText("Grace Hopper")).toBeTruthy();
        expect(screen.queryByText("Linus Torvalds")).toBeNull();

        fireEvent.click(screen.getAllByRole("button", { name: "Cancel" }).at(-1)!);

        expect(screen.getByText("None")).toBeTruthy();
        expect(screen.queryByText("Ada Lovelace")).toBeNull();
    });

    it("commits selected attendees and submits their ids with the booking", () => {
        renderOpenEditor();

        fireEvent.click(screen.getByRole("button", { name: /invite attendees/i }));
        fireEvent.click(screen.getByRole("checkbox", { name: /ada lovelace/i }));
        fireEvent.click(screen.getByRole("checkbox", { name: /grace hopper/i }));
        fireEvent.click(screen.getByRole("button", { name: "Save selection" }));

        expect(screen.getByText("2 selected")).toBeTruthy();
        expect(screen.getByText("Ada Lovelace")).toBeTruthy();
        expect(screen.getByText("Grace Hopper")).toBeTruthy();

        fireEvent.change(screen.getByPlaceholderText("e.g. Sprint Planning"), {
            target: { value: "Sprint Planning" },
        });
        fireEvent.click(screen.getByRole("button", { name: /reserve/i }));

        expect(mocks.mutationFlow.submitBooking).toHaveBeenCalledTimes(1);
        expect(mocks.mutationFlow.submitBooking.mock.calls[0]?.[0]).toMatchObject({
            title: "Sprint Planning",
            roomId: "room-1",
            attendeeIds: ["user-1", "user-2"],
            description: "",
        });

        const attendeeSummary = screen.getByText("2 selected").closest("button");
        expect(attendeeSummary ? within(attendeeSummary).getByText("Invite attendees") : null).toBeTruthy();
    });

    it("blocks submitting a booking that starts in the past", () => {
        renderOpenEditor({
            roomId: "room-1",
            start: new Date("2000-04-29T09:00:00"),
            end: new Date("2000-04-29T10:00:00"),
        });

        fireEvent.change(screen.getByPlaceholderText("e.g. Sprint Planning"), {
            target: { value: "Sprint Planning" },
        });

        const reserveButton = screen.getByRole("button", { name: /reserve/i });
        expect(screen.getByText("Start time must be in the future")).toBeTruthy();
        expect(reserveButton.hasAttribute("disabled")).toBe(true);

        fireEvent.click(reserveButton);

        expect(mocks.mutationFlow.submitBooking).not.toHaveBeenCalled();
    });
});
