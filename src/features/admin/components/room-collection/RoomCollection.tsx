import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { useDeferredValue } from "react";

import { EmptyState } from "@/features/admin/components/EmptyState";
import { RoomCollectionGrid } from "@/features/admin/components/room-collection/RoomCollectionGrid";
import { RoomCollectionList } from "@/features/admin/components/room-collection/RoomCollectionList";
import { RoomCollectionToolbar } from "@/features/admin/components/room-collection/RoomCollectionToolbar";
import { roomsQueryOptions, type RoomsQueryData } from "@/features/admin/services/rooms/queries";

const selectRoomCollection = (rows: RoomsQueryData) =>
    rows.map((row) => ({
        id: row.roomId,
        name: row.name,
        location: row.location,
        capacity: row.capacity,
        maxBookingDurationHours: row.maxBookingDurationHours,
        active: row.available,
        equipment: row.equipment,
    }));

export const RoomCollection = () => {
    const search = useSearch({ from: "/admin/rooms" });
    const q = useDeferredValue(search.q);
    const status = useDeferredValue(search.status);
    const sort = useDeferredValue(search.sort);
    const view = useDeferredValue(search.view);
    const { data: rooms } = useSuspenseQuery({
        ...roomsQueryOptions({ q, status, sort, view }),
        select: selectRoomCollection,
    });

    if (rooms.length === 0) {
        return (
            <div className="p-6">
                <EmptyState
                    icon={Building2}
                    title="No rooms yet"
                    description="Create your first meeting room to get started with the booking system."
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <RoomCollectionToolbar resultCount={rooms.length} />

            {search.view === "list" ? <RoomCollectionList rooms={rooms} /> : <RoomCollectionGrid rooms={rooms} />}
        </div>
    );
};
