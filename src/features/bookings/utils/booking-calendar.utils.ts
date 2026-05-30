import type { EventInput } from "@fullcalendar/core";

import type { BookingCalendarData } from "@/features/bookings/services/queries";

export type BookingCalendarEvent = BookingCalendarData["events"][number];
export const bookingCalendarViews = ["day", "week", "month", "year"] as const;
export type BookingCalendarView = (typeof bookingCalendarViews)[number];

export type RoomAccent = {
    hue: string;
    stripe: string;
    wash: string;
    washHover: string;
};

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

const roomAccents: RoomAccent[] = [
    {
        hue: "Amber",
        stripe: "#e8c29a",
        wash: "rgba(232,194,154,0.06)",
        washHover: "rgba(232,194,154,0.12)",
    },
    {
        hue: "Rust",
        stripe: "#b66a4a",
        wash: "rgba(182,106,74,0.07)",
        washHover: "rgba(182,106,74,0.14)",
    },
    {
        hue: "Steel",
        stripe: "#7a8fa8",
        wash: "rgba(122,143,168,0.07)",
        washHover: "rgba(122,143,168,0.14)",
    },
    {
        hue: "Sage",
        stripe: "#6a8a6e",
        wash: "rgba(106,138,110,0.07)",
        washHover: "rgba(106,138,110,0.14)",
    },
    {
        hue: "Plum",
        stripe: "#8a6a8a",
        wash: "rgba(138,106,138,0.07)",
        washHover: "rgba(138,106,138,0.14)",
    },
];

export const getRoomAccent = (index: number) => roomAccents[index % roomAccents.length] ?? roomAccents[0];

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
        const start = new Date(event.start);
        const end = new Date(event.end);
        if (start <= now && now < end) count += 1;
    }
    return count;
};

export const getBookingCalendarTitle = (view: BookingCalendarView, date: Date) => {
    if (view === "day") {
        return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
    if (view === "week") {
        const start = new Date(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const sameMonth = start.getMonth() === end.getMonth();
        const sameYear = start.getFullYear() === end.getFullYear();
        const startStr = start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            ...(sameYear ? {} : { year: "numeric" }),
        });
        const endStr = end.toLocaleDateString("en-US", {
            month: sameMonth ? undefined : "short",
            day: "numeric",
            year: "numeric",
        });
        return `${startStr} – ${endStr}`;
    }
    if (view === "year") {
        return String(date.getFullYear());
    }
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export const formatTodayButtonDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

const getEventEndDate = (event: EventInput) => {
    if (!event.end) return null;
    return typeof event.end === "string" ? new Date(event.end) : (event.end as Date);
};

export const isPastCalendarEvent = (event: EventInput, now = new Date()) => {
    const end = getEventEndDate(event);
    return !!end && end.getTime() <= now.getTime();
};
