import { describe, expect, it } from "vitest";

import { bookingEventsSchema, cancelBookingSchema, createBookingSchema } from "#app/modules/booking/booking.schema";

const roomId = "00000000-0000-4000-8000-000000000001";
const events = { rangeStart: "2026-01-01T00:00:00.000Z", rangeEnd: "2026-01-08T00:00:00.000Z" };
const booking = {
    title: "Planning",
    roomId,
    startTime: "2099-01-01T01:00:00.000Z",
    endTime: "2099-01-01T02:00:00.000Z",
};

function daysAfter(start: string, days: number) {
    return new Date(Date.parse(start) + days * 86_400_000).toISOString();
}

describe("calendar event range", () => {
    it("accepts a week and a full year", () => {
        expect(bookingEventsSchema.safeParse(events).success).toBe(true);
        expect(bookingEventsSchema.safeParse({ ...events, rangeEnd: daysAfter(events.rangeStart, 366) }).success).toBe(
            true,
        );
        expect(bookingEventsSchema.safeParse({ ...events, rangeEnd: daysAfter(events.rangeStart, 400) }).success).toBe(
            true,
        );
    });

    it("rejects ranges that are too long, empty, or backwards", () => {
        for (const rangeEnd of [
            daysAfter(events.rangeStart, 401),
            events.rangeStart,
            daysAfter(events.rangeStart, -1),
        ]) {
            expect(bookingEventsSchema.safeParse({ ...events, rangeEnd }).success).toBe(false);
        }
    });
});

describe("booking input limits", () => {
    it("allows up to 100 unique attendees", () => {
        const attendeeIds = Array.from({ length: 100 }, (_, index) => `user-${index}`);
        expect(createBookingSchema.parse({ ...booking, attendeeIds }).attendeeIds).toHaveLength(100);
        expect(createBookingSchema.parse(booking).attendeeIds).toEqual([]);
    });

    it("rejects more than 100, duplicate, or blank attendee IDs", () => {
        const tooMany = Array.from({ length: 101 }, (_, index) => `user-${index}`);
        for (const attendeeIds of [tooMany, ["a", "a"], [""], ["x".repeat(129)]]) {
            expect(createBookingSchema.safeParse({ ...booking, attendeeIds }).success).toBe(false);
        }
    });

    it.each([
        ["title", "x".repeat(161)],
        ["description", "x".repeat(1001)],
    ])("rejects a %s that is too long", (field, value) => {
        expect(createBookingSchema.safeParse({ ...booking, [field]: value }).success).toBe(false);
    });

    it("rejects a cancellation reason over 500 characters", () => {
        const base = { bookingId: roomId };
        expect(cancelBookingSchema.safeParse({ ...base, cancelReason: "x".repeat(500) }).success).toBe(true);
        expect(cancelBookingSchema.safeParse({ ...base, cancelReason: "x".repeat(501) }).success).toBe(false);
    });
});
