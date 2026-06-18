import { queryOptions } from "@tanstack/react-query";

import type { RoomsSearch } from "@/features/admin/schema/rooms-search.schema";
import { getRoomFn, getRoomsFn } from "@/features/admin/services/rooms/fns";

export type RoomQueryData = Awaited<ReturnType<typeof getRoomFn>>;
export type RoomsQueryData = Awaited<ReturnType<typeof getRoomsFn>>;

export const roomsListQueryKey = ["admin", "rooms", "list"] as const;

export const roomQueryOptions = (roomId: string) => {
    return queryOptions({
        queryKey: ["admin", "rooms", "detail", roomId],
        queryFn: () => getRoomFn({ data: { roomId } }),
    });
};

export const roomsQueryOptions = (filters?: RoomsSearch) => {
    return queryOptions({
        queryKey: [...roomsListQueryKey, filters],
        queryFn: () => getRoomsFn({ data: filters ?? {} }),
    });
};
