import { queryOptions } from "@tanstack/react-query";
import { format } from "date-fns";

import { getAdminBookingStatsFn, getAdminBookingsFn } from "@/features/admin/services/bookings/fns";

export type AdminBookingStatus = "upcoming" | "in-progress" | "completed" | "cancelled";

export type AdminBookingFilters = {
    q: string;
    room: string;
    status: AdminBookingStatus | "all";
};

type AdminBooking = {
    id: string;
    title: string;
    room: string;
    bookedBy: string;
    attendees: number;
    date: string;
    time: string;
    startTime: string;
    endTime: string;
    status: AdminBookingStatus;
};

const getBookingStatus = ({ endTime, startTime, status }: { endTime: string; startTime: string; status: string }) => {
    if (status === "cancelled") return "cancelled";

    const now = Date.now();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (now < start) return "upcoming";
    if (now < end) return "in-progress";
    return "completed";
};

const formatBookingTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    return `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`;
};

export const adminBookingsQueryOptions = (filters: AdminBookingFilters) =>
    queryOptions({
        queryKey: ["admin", "bookings", filters],
        queryFn: () => getAdminBookingsFn({ data: filters }),
        select: (data) => ({
            bookings: data.bookings.map<AdminBooking>((row) => ({
                id: row.id,
                title: row.title,
                room: row.room,
                bookedBy: row.bookedBy,
                attendees: row.attendees,
                date: format(new Date(row.startTime), "yyyy-MM-dd"),
                time: formatBookingTime(row.startTime, row.endTime),
                startTime: row.startTime,
                endTime: row.endTime,
                status: getBookingStatus(row),
            })),
            rooms: data.rooms,
        }),
    });

export const adminBookingStatsQueryOptions = () =>
    queryOptions({
        queryKey: ["admin", "bookings", "stats"],
        queryFn: () => getAdminBookingStatsFn(),
    });
