import { queryOptions } from "@tanstack/react-query";

import type { RoomsSearch } from "@/features/admin/schema/rooms-search.schema";
import { getRoomFn, getRoomsFn } from "@/features/admin/services/rooms/fns";

export type RoomQueryData = Awaited<ReturnType<typeof getRoomFn>>;
export type RoomsQueryData = Awaited<ReturnType<typeof getRoomsFn>>;

export const roomQueries = {
    all: () => ["admin", "rooms"],
    lists: () => [...roomQueries.all(), "list"],
    list: (filters?: RoomsSearch) =>
        queryOptions({
            queryKey: [...roomQueries.lists(), filters],
            queryFn: () => getRoomsFn({ data: filters ?? {} }),
        }),
    details: () => [...roomQueries.all(), "detail"],
    detail: (roomId: string) =>
        queryOptions({
            queryKey: [...roomQueries.details(), roomId],
            queryFn: () => getRoomFn({ data: { roomId } }),
        }),
};
