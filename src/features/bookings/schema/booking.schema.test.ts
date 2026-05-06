import { describe, expect, it } from "vitest";

import { PAST_BOOKING_START_MESSAGE } from "@/features/bookings/booking.constants";

import { createBookingSchema } from "./booking.schema";

const validBooking = {
    title: "Sprint Planning",
    roomId: "550e8400-e29b-41d4-a716-446655440000",
    startTime: "2099-04-29T09:00:00.000Z",
    endTime: "2099-04-29T10:00:00.000Z",
    description: "",
    attendeeIds: [],
};

describe("createBookingSchema", () => {
    it("rejects bookings that start in the past", () => {
        const result = createBookingSchema.safeParse({
            ...validBooking,
            startTime: "2000-04-29T09:00:00.000Z",
            endTime: "2000-04-29T10:00:00.000Z",
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues.some((issue) => issue.message === PAST_BOOKING_START_MESSAGE)).toBe(true);
    });
});
