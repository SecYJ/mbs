import { describe, expect, it } from "vitest";

import type { BookingCalendarEvent } from "@/features/bookings/services/queries";
import { getRoomDayModel } from "@/features/bookings/utils/room-day";

const date = "2040-06-12";

function at(time: string, day = date) {
    return new Date(`${day}T${time}:00`);
}

function event(id: string, start: Date, end: Date) {
    return {
        id,
        resourceId: "room",
        title: id,
        start: start.toISOString(),
        end: end.toISOString(),
        extendedProps: {
            resourceId: "room",
            organizer: "Owner",
            attendees: [],
            attendeeIds: [],
            description: "",
            canManage: true,
        },
    } satisfies BookingCalendarEvent;
}

describe("room day model", () => {
    it("counts overlapping and adjoining bookings once when calculating free time", () => {
        const events = [
            event("adjoining", at("13:00"), at("14:00")),
            event("nested", at("11:30"), at("11:45")),
            event("first", at("10:00"), at("12:00")),
            event("overlap", at("11:00"), at("13:00")),
        ];

        const result = getRoomDayModel(events, date, at("12:15"));

        expect(result.summary).toEqual({ bookingCount: 4, freeMinutes: 13 * 60, hasLiveBooking: true });
        expect(
            result.segments.filter((segment) => segment.type === "booking").map((segment) => segment.event.id),
        ).toEqual(["first", "overlap", "nested", "adjoining"]);
        expect(
            result.segments.filter((segment) => segment.type === "free").map(({ start, end }) => ({ start, end })),
        ).toEqual([
            { start: at("07:00"), end: at("10:00") },
            { start: at("14:00"), end: at("00:00", "2040-06-13") },
        ]);
        expect(result.bookableSlot).toEqual({ start: at("14:00"), end: at("15:00") });
        expect(events.map(({ id }) => id)).toEqual(["adjoining", "nested", "first", "overlap"]);
    });

    it("clips bookings to the selected day and excludes exact outside boundaries", () => {
        const result = getRoomDayModel(
            [
                event("before", at("06:00"), at("07:00")),
                event("morning", at("06:00"), at("08:00")),
                event("overnight", at("23:00"), at("01:00", "2040-06-13")),
                event("next day", at("00:00", "2040-06-13"), at("01:00", "2040-06-13")),
            ],
            date,
            at("08:00"),
        );

        expect(result.selectedDate).toEqual(at("00:00"));
        expect(result.summary).toEqual({ bookingCount: 2, freeMinutes: 15 * 60, hasLiveBooking: false });
        expect(
            result.segments.filter((segment) => segment.type === "booking").map(({ start, end }) => ({ start, end })),
        ).toEqual([
            { start: at("07:00"), end: at("08:00") },
            { start: at("23:00"), end: at("00:00", "2040-06-13") },
        ]);
    });

    it("starts a reservation strictly after now and keeps it inside the available gap", () => {
        const events = [event("meeting", at("10:45"), at("11:30"))];

        expect(getRoomDayModel(events, date, at("10:00")).bookableSlot).toEqual({
            start: at("10:30"),
            end: at("10:45"),
        });
        expect(getRoomDayModel(events, date, at("10:44")).bookableSlot).toEqual({
            start: at("11:30"),
            end: at("12:30"),
        });
    });

    it("keeps an empty past day visible without offering a reservation", () => {
        const result = getRoomDayModel([], date, at("09:00", "2040-06-13"));

        expect(result.summary).toEqual({ bookingCount: 0, freeMinutes: 17 * 60, hasLiveBooking: false });
        expect(result.bookableSlot).toBeNull();
        expect(result.segments).toEqual([
            {
                type: "free",
                start: at("07:00"),
                end: at("00:00", "2040-06-13"),
                bookableSlot: null,
            },
        ]);
    });
});
