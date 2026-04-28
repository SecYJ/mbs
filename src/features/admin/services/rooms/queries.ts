import { queryOptions } from "@tanstack/react-query";

import type { Room } from "@/features/admin/components/room-row";
import { getRoomsFn } from "@/features/admin/services/rooms/fns";

export const roomsQueryOptions = () =>
    queryOptions({
        queryKey: ["admin", "rooms"],
        queryFn: getRoomsFn,
        select: (rows): Room[] =>
            rows.map((row) => ({
                id: row.roomId,
                name: row.name,
                location: row.location,
                capacity: row.capacity,
                active: row.available,
                equipment: row.equipment,
            })),
    });
