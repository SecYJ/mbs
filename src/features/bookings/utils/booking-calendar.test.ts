import { describe, expect, it } from "vite-plus/test";

import {
    getBookingEventInput,
    getFilteredRooms,
    getLiveBookingCount,
    getRoomFilterState,
    getVisibleEvents,
    isPastCalendarEvent,
    sortStrings,
    type BookingCalendarEvent,
} from "./booking-calendar";

const bookingEvent = {
    id: "booking-1",
    title: "Planning",
    roomId: "room-a",
    start: "2099-04-29T09:00:00.000Z",
    end: "2099-04-29T10:00:00.000Z",
    description: "Sprint planning",
    canManage: true,
    organizer: { id: "user-1", name: "Avery", email: "avery@example.com" },
    attendees: [{ id: "user-2", name: "Blair", email: "blair@example.com" }],
} as BookingCalendarEvent;

describe("booking calendar utilities", () => {
    it("filters rooms by capacity, equipment, and location", () => {
        const rooms = [
            { id: "room-a", title: "Aurora", capacity: 8, equipment: ["Display", "Whiteboard"], location: "3F" },
            { id: "room-b", title: "Borealis", capacity: 4, equipment: ["Display"], location: "2F" },
        ];

        const filterState = getRoomFilterState({ capacity: 6, equipment: ["Whiteboard"], location: ["3F"] });

        expect(getFilteredRooms(rooms, filterState).map((room) => room.id)).toEqual(["room-a"]);
    });

    it("maps booking events into FullCalendar event inputs", () => {
        expect(getBookingEventInput(bookingEvent)).toMatchObject({
            id: "booking-1",
            resourceId: "room-a",
            title: "Planning",
            extendedProps: {
                attendeeIds: ["user-2"],
                attendees: ["Blair"],
                canManage: true,
                organizer: "Avery",
            },
        });
    });

    it("uses filtered room ids for non-day event visibility", () => {
        const events = [
            { id: "booking-1", resourceId: "room-a" },
            { id: "booking-2", resourceId: "room-b" },
        ];

        expect(getVisibleEvents(events, [{ id: "room-a" }], "week").map((event) => event.id)).toEqual(["booking-1"]);
        expect(getVisibleEvents(events, [{ id: "room-a" }], "day").map((event) => event.id)).toEqual([
            "booking-1",
            "booking-2",
        ]);
    });

    it("counts currently live bookings", () => {
        const now = new Date("2099-04-29T09:30:00.000Z");
        const events = [
            bookingEvent,
            { ...bookingEvent, id: "booking-2", start: "2099-04-29T10:00:00.000Z", end: "2099-04-29T11:00:00.000Z" },
        ];

        expect(getLiveBookingCount(events, now)).toBe(1);
    });

    it("sorts option labels without mutating the input", () => {
        const values = ["Projector", "Display", "Camera"];

        expect(sortStrings(values)).toEqual(["Camera", "Display", "Projector"]);
        expect(values).toEqual(["Projector", "Display", "Camera"]);
    });

    it("parses calendar event end dates for past event checks", () => {
        const now = new Date("2099-04-29T10:00:00.000Z");

        expect(isPastCalendarEvent({ end: "2099-04-29T09:00:00.000Z" }, now)).toBe(true);
        expect(isPastCalendarEvent({ end: "not-a-date" }, now)).toBe(false);
        expect(isPastCalendarEvent({}, now)).toBe(false);
    });
});
