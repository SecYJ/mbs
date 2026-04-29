import { describe, expect, it } from "vitest";

import { getBookingHistoryItem } from "./booking-history";

describe("getBookingHistoryItem", () => {
    it("preserves cancellation metadata and marks cancelled bookings as history items", () => {
        const historyItem = getBookingHistoryItem({
            booking: {
                id: "550e8400-e29b-41d4-a716-446655440000",
                roomId: "650e8400-e29b-41d4-a716-446655440000",
                title: "Sprint Planning",
                description: "Plan the sprint",
                startTime: new Date("2099-04-29T09:00:00.000Z"),
                endTime: new Date("2099-04-29T10:00:00.000Z"),
                status: "cancelled",
                cancelledAt: new Date("2099-04-28T12:00:00.000Z"),
                cancelReason: "Room no longer needed",
            },
            room: {
                name: "Aurora",
                location: "3F East",
            },
            organizer: {
                id: "organizer-1",
                name: "Ada Lovelace",
                email: "ada@example.com",
            },
            cancelledBy: {
                id: "organizer-1",
                name: "Ada Lovelace",
                email: "ada@example.com",
            },
            attendees: [
                {
                    id: "attendee-1",
                    name: "Grace Hopper",
                    email: "grace@example.com",
                },
            ],
            now: new Date("2099-04-28T13:00:00.000Z"),
        });

        expect(historyItem).toMatchObject({
            id: "550e8400-e29b-41d4-a716-446655440000",
            title: "Sprint Planning",
            status: "cancelled",
            cancelReason: "Room no longer needed",
            cancelledAt: "2099-04-28T12:00:00.000Z",
            cancelledBy: {
                id: "organizer-1",
                name: "Ada Lovelace",
            },
            room: {
                name: "Aurora",
                location: "3F East",
            },
            attendees: [
                {
                    id: "attendee-1",
                    name: "Grace Hopper",
                },
            ],
        });
    });
});
