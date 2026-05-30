import { describe, expect, it } from "vite-plus/test";

import type { BookingCalendarEvent } from "./booking-calendar.utils";
import {
    formatDateKey,
    getBookableSlotForSegment,
    getDayBounds,
    getDaySegments,
    getRoomDayEvents,
    parseDateKey,
} from "./room-booking-day.utils";

const event = {
    id: "booking-1",
    title: "Planning",
    roomId: "room-a",
    start: "2099-04-29T09:00:00.000Z",
    end: "2099-04-29T10:00:00.000Z",
    description: "",
    canManage: false,
    organizer: { id: "user-1", name: "Avery", email: "avery@example.com" },
    attendees: [],
} as BookingCalendarEvent;

describe("room booking day utilities", () => {
    it("round-trips valid date keys and falls back on invalid dates", () => {
        const date = parseDateKey("2099-04-29");

        expect(formatDateKey(date)).toBe("2099-04-29");
        expect(formatDateKey(parseDateKey("2099-02-31"))).not.toBe("2099-02-31");
    });

    it("filters and sorts room day events inside day bounds", () => {
        const { start, end } = getDayBounds(parseDateKey("2099-04-29"));
        const events = [
            { ...event, id: "booking-late", start: "2099-04-29T12:00:00.000Z", end: "2099-04-29T13:00:00.000Z" },
            event,
            { ...event, id: "booking-other-room", roomId: "room-b" },
        ];

        expect(getRoomDayEvents(events, "room-a", start, end).map((item) => item.id)).toEqual([
            "booking-1",
            "booking-late",
        ]);
    });

    it("creates free and booked day segments", () => {
        const dayStart = new Date("2099-04-29T08:00:00.000Z");
        const dayEnd = new Date("2099-04-29T11:00:00.000Z");

        expect(getDaySegments([event], dayStart, dayEnd).map((segment) => segment.type)).toEqual([
            "free",
            "booking",
            "free",
        ]);
    });

    it("returns a bookable slot inside a free segment", () => {
        const start = new Date(Date.now() + 60 * 60 * 1000);
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
        const slot = getBookableSlotForSegment({ type: "free", start, end });

        expect(slot).not.toBeNull();
        expect(slot?.start.getTime()).toBeGreaterThanOrEqual(start.getTime());
        expect(slot?.end.getTime()).toBeLessThanOrEqual(end.getTime());
    });
});
