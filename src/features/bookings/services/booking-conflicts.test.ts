import { describe, expect, it } from "vitest";

import { getBookingConflictMessage } from "./booking-conflicts";

const conflict = {
    title: "Leadership Weekly",
    roomName: "Aurora",
    startTime: new Date("2099-04-29T09:00:00.000Z"),
    endTime: new Date("2099-04-29T10:30:00.000Z"),
};

describe("getBookingConflictMessage", () => {
    it("formats create conflicts with the occupied booking slot", () => {
        expect(getBookingConflictMessage(conflict)).toBe(
            'Aurora is occupied on Apr 29, 2099 from 9:00 AM to 10:30 AM for "Leadership Weekly". Choose a different time or room.',
        );
    });

    it("formats edit conflicts without private booking details when needed", () => {
        expect(getBookingConflictMessage({ ...conflict, canViewDetails: false })).toBe(
            "Aurora is occupied on Apr 29, 2099 from 9:00 AM to 10:30 AM. Choose a different time or room.",
        );
    });
});
