import type { EventInput } from "@fullcalendar/core";
import { compareAsc, isBefore, parseISO } from "date-fns";
import { z } from "zod";

import type { BookingCalendarData } from "@/features/bookings/services/queries";

export type BookingCalendarEvent = BookingCalendarData["events"][number];
export const bookingCalendarViews = ["day", "week", "month", "year"] as const;
export type BookingCalendarView = (typeof bookingCalendarViews)[number];

export type FilterableRoom = {
    capacity: number;
    equipment: string[];
    location: string;
};

export type RoomFilters = {
    capacity: number;
    equipment: string[];
    location: string[];
};

export const bookingCalendarViewMap: Record<BookingCalendarView, string> = {
    day: "resourceTimeGridDay",
    week: "timeGridWeek",
    month: "dayGridMonth",
    year: "multiMonthYear",
};

export const getBookingEventInput = (event: BookingCalendarEvent) => ({
    id: event.id,
    resourceId: event.roomId,
    title: event.title,
    start: event.start,
    end: event.end,
    extendedProps: {
        resourceId: event.roomId,
        organizerId: event.organizer.id,
        organizer: event.organizer.name,
        organizerEmail: event.organizer.email,
        attendees: event.attendees.map((attendee) => attendee.name),
        attendeeIds: event.attendees.map((attendee) => attendee.id),
        description: event.description,
        canManage: event.canManage,
    },
});

export const sortStrings = (values: string[]) => values.toSorted((a, b) => a.localeCompare(b));

export const getRoomFilterState = ({ capacity, equipment, location }: RoomFilters) => ({
    minCapacity: capacity,
    equipmentSet: equipment.length > 0 ? new Set(equipment) : null,
    locationSet: location.length > 0 ? new Set(location) : null,
});

export type RoomFilterState = ReturnType<typeof getRoomFilterState>;

const roomMatchesFilterState = (room: FilterableRoom, filterState: RoomFilterState) => {
    if (filterState.minCapacity > 0 && room.capacity < filterState.minCapacity) return false;
    if (filterState.locationSet && !filterState.locationSet.has(room.location)) return false;
    if (!filterState.equipmentSet) return true;

    const roomEquipment = new Set(room.equipment);
    for (const item of filterState.equipmentSet) {
        if (!roomEquipment.has(item)) return false;
    }
    return true;
};

export const getFilteredRooms = <TRoom extends FilterableRoom>(rooms: TRoom[], filterState: RoomFilterState) =>
    rooms.filter((room) => roomMatchesFilterState(room, filterState));

export const getFilteredRoomCount = (rooms: FilterableRoom[], filterState: RoomFilterState) => {
    let count = 0;
    for (const room of rooms) {
        if (roomMatchesFilterState(room, filterState)) count += 1;
    }
    return count;
};

export const getVisibleEvents = (events: EventInput[], filteredRooms: { id: string }[], view: BookingCalendarView) => {
    if (view === "day") return events;

    const filteredRoomIds = new Set(filteredRooms.map((room) => room.id));
    return events.filter((event) => typeof event.resourceId === "string" && filteredRoomIds.has(event.resourceId));
};

export const getLiveBookingCount = (events: BookingCalendarEvent[], now: Date) => {
    let count = 0;
    for (const event of events) {
        const start = parseISO(event.start);
        const end = parseISO(event.end);
        if (compareAsc(start, now) <= 0 && isBefore(now, end)) count += 1;
    }
    return count;
};

const eventEndDateSchema = z
    .preprocess((value) => (value ? value : undefined), z.coerce.date().optional())
    .transform((date) => date ?? null)
    .catch(null);

const getEventEndDate = (event: EventInput) => eventEndDateSchema.parse(event.end);

export const isPastCalendarEvent = (event: EventInput, now = new Date()) => {
    const end = getEventEndDate(event);
    return !!end && compareAsc(end, now) <= 0;
};
