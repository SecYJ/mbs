import { queryOptions } from "@tanstack/react-query";

import { getRoomsFn } from "@/features/admin/services/rooms/fns";
import type { Room } from "@/features/admin/types";

export const roomsQueryOptions = () =>
    queryOptions({
        queryKey: ["admin", "rooms"],
        queryFn: getRoomsFn,
        select: (rows) =>
            rows.map<Room>((row) => ({
                id: row.roomId,
                name: row.name,
                location: row.location,
                capacity: row.capacity,
                active: row.available,
                equipment: row.equipment,
            })),
    });
