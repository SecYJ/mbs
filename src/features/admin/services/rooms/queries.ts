import { queryOptions } from "@tanstack/react-query";

import type { RoomsSearch } from "@/features/admin/schema/rooms-search.schema";
import { getRoomFn, getRoomsFn } from "@/features/admin/services/rooms/fns";
import type { Room } from "@/features/admin/types";

export const roomsQueryKey = ["admin", "rooms"] as const;

type RoomQueryRow = {
    roomId: string;
    name: string;
    location: string;
    capacity: number;
    maxBookingDurationHours: number;
    available: boolean;
    equipment: Room["equipment"];
};

const toRoom = (row: RoomQueryRow): Room => ({
    id: row.roomId,
    name: row.name,
    location: row.location,
    capacity: row.capacity,
    maxBookingDurationHours: row.maxBookingDurationHours,
    active: row.available,
    equipment: row.equipment,
});

export const roomQueryOptions = (roomId?: string) =>
    queryOptions({
        queryKey: [...roomsQueryKey, "detail", roomId],
        queryFn: () => (roomId ? getRoomFn({ data: { roomId } }) : Promise.resolve(null)),
        select: (row) => (row ? toRoom(row) : null),
    });

export const roomsQueryOptions = (filters: RoomsSearch) =>
    queryOptions({
        queryKey: [...roomsQueryKey, filters],
        queryFn: () => getRoomsFn({ data: filters }),
        select: (rows) => rows.map(toRoom),
    });
