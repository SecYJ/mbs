import type { UserRole } from "@mbs/shared/roles";

export type BookingRoomResponse = {
    id: string;
    title: string;
    location: string;
    capacity: number;
    maxBookingDurationHours: number;
    available: boolean;
    equipment: string[];
};

type BookingUserResponse = {
    id: string;
    name: string;
    email: string;
};

type AttendanceStatus = "pending" | "accepted" | "declined";

export type BookingCalendarDataResponse = {
    currentUserId: string;
    currentUserRole: UserRole;
    rooms: BookingRoomResponse[];
    users: BookingUserResponse[];
};

export type BookingEventResponse = {
    id: string;
    resourceId: string;
    title: string;
    start: string;
    end: string;
    extendedProps: {
        resourceId: string;
        organizer: string;
        attendees: string[];
        attendeeIds: string[];
        description: string;
        canManage: boolean;
    };
};

export type BookingRoomCatalogResponse = {
    totalRoomCount: number;
    allEquipment: string[];
    allLocations: string[];
};

export type BookingSummaryResponse = {
    bookingCount: number;
    liveBookingCount: number;
};

export type BookingDetailsResponse = {
    booking: {
        id: string;
        title: string;
        description: string;
        start: string;
        end: string;
        status: "active" | "cancelled";
        cancelledAt: string | null;
        cancelReason: string;
        createdAt: string | null;
        updatedAt: string | null;
    };
    room: {
        id: string;
        name: string;
        location: string;
        capacity: number;
        maxBookingDurationHours: number;
        available: boolean;
    };
    equipment: { name: string; brand: string; model: string }[];
    organizer: BookingUserResponse;
    cancelledBy: BookingUserResponse | null;
    attendees: (BookingUserResponse & { status: AttendanceStatus })[];
    currentUserAttendance: { status: AttendanceStatus } | null;
    isOrganizer: boolean;
    canRespond: boolean;
};
