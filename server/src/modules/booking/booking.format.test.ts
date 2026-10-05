import { describe, expect, it } from "vitest";

import { formatBookingSlot } from "#app/modules/booking/booking.format";

// The ICU version decides whether a narrow no-break space sits before AM/PM, so compare with plain spaces.
function plain(value: string) {
    return value.replaceAll(/\s/g, " ");
}

describe("booking time formatting", () => {
    it("uses the app time zone rather than UTC or the server's zone", () => {
        expect(plain(formatBookingSlot(new Date("2026-09-20T01:00:00Z"), new Date("2026-09-20T02:30:00Z")))).toBe(
            "Sep 20, 2026 from 9:00 AM to 10:30 AM",
        );
    });

    it("moves the date forward when UTC is still the previous day", () => {
        expect(plain(formatBookingSlot(new Date("2026-12-31T16:30:00Z"), new Date("2026-12-31T17:30:00Z")))).toBe(
            "Jan 1, 2027 from 12:30 AM to 1:30 AM",
        );
    });
});
