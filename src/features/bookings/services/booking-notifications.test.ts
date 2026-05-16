import { describe, expect, it } from "vite-plus/test";

import { getBookingCancellationNotificationValues } from "./booking-notifications";

describe("getBookingCancellationNotificationValues", () => {
    it("creates cancellation notifications for each participant with room and time context", () => {
        const notifications = getBookingCancellationNotificationValues({
            attendeeIds: ["user-1", "user-2"],
            booking: {
                id: "550e8400-e29b-41d4-a716-446655440000",
                title: "Sprint Planning",
                startTime: new Date("2099-04-29T09:00:00.000Z"),
                endTime: new Date("2099-04-29T10:00:00.000Z"),
                roomName: "Aurora",
                roomLocation: "3F East",
            },
        });

        expect(notifications).toEqual([
            {
                bookingId: "550e8400-e29b-41d4-a716-446655440000",
                userId: "user-1",
                message:
                    "Booking canceled: Sprint Planning in Aurora, 3F East on Apr 29, 2099 from 9:00 AM to 10:00 AM",
            },
            {
                bookingId: "550e8400-e29b-41d4-a716-446655440000",
                userId: "user-2",
                message:
                    "Booking canceled: Sprint Planning in Aurora, 3F East on Apr 29, 2099 from 9:00 AM to 10:00 AM",
            },
        ]);
    });
});
