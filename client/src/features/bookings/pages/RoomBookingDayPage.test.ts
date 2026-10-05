import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

import { RoomBookingDayPage } from "@/features/bookings/pages/RoomBookingDayPage";

const snapshot = vi.hoisted(() => ({
    deferredDate: "2040-06-12",
    requestedDate: "2040-06-13",
    eventsQuery: vi.fn(),
    room: {
        id: "room",
        title: "Meeting Room",
        location: "East Wing",
        capacity: 8,
        available: true,
        maxBookingDurationHours: 4,
        equipment: [],
    },
    events: [
        {
            id: "booking",
            resourceId: "room",
            title: "Existing meeting",
            start: new Date("2040-06-12T10:00:00").toISOString(),
            end: new Date("2040-06-12T11:00:00").toISOString(),
            extendedProps: {
                resourceId: "room",
                organizer: "Owner",
                attendees: [],
                attendeeIds: [],
                description: "",
                canManage: true,
            },
        },
    ],
}));

vi.mock("react", async (importOriginal) => ({
    ...(await importOriginal<typeof import("react")>()),
    useDeferredValue: () => snapshot.deferredDate,
}));

vi.mock("@tanstack/react-router", () => ({
    getRouteApi() {
        return {
            useParams: () => ({ roomId: "room" }),
            useSearch: () => ({ date: snapshot.requestedDate }),
            useNavigate: () => vi.fn(),
        };
    },
    Link({ children }: { children: ReactNode }) {
        return createElement("a", null, children);
    },
}));

vi.mock("@tanstack/react-query", () => ({
    useSuspenseQueries({ combine }: { combine: (results: { data: unknown }[]) => unknown }) {
        return combine([{ data: snapshot.events }, { data: snapshot.room }]);
    },
}));

vi.mock("@/features/bookings/services/queries", () => ({
    bookingCalendarQueries: {
        roomDayEvents: snapshot.eventsQuery,
        room: () => ({}),
    },
}));

vi.mock("@/features/bookings/components/reservation/ReservationEditorDialog", () => ({
    ReservationEditorDialog: () => null,
}));

it("renders the schedule and summary for the deferred query date while the URL advances", () => {
    const html = renderToStaticMarkup(createElement(RoomBookingDayPage));

    expect(snapshot.eventsQuery).toHaveBeenCalledWith({ roomId: "room", date: snapshot.deferredDate });
    expect(html).toContain("June 12, 2040");
    expect(html).not.toContain("June 13, 2040");
    expect(html).toContain("Existing meeting");
    expect(html).toContain("16 hours");
});
