import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { useDeferredValue, type ReactNode } from "react";

import { EmptyState } from "@/features/admin/components/EmptyState";
import { RoomCollectionGrid } from "@/features/admin/components/room-collection/RoomCollectionGrid";
import { RoomCollectionList } from "@/features/admin/components/room-collection/RoomCollectionList";
import { RoomCollectionToolbar } from "@/features/admin/components/room-collection/RoomCollectionToolbar";
import { roomQueries, type RoomsQueryData } from "@/features/admin/services/rooms/queries";

const selectRoomCollection = (rows: RoomsQueryData) => {
    return rows.map((row) => ({
        id: row.roomId,
        name: row.name,
        location: row.location,
        capacity: row.capacity,
        maxBookingDurationHours: row.maxBookingDurationHours,
        active: row.available,
        equipment: row.equipment,
    }));
};

export const RoomCollection = () => {
    const search = useSearch({ from: "/admin/rooms", select: (s) => ({ ...s, view: s.view ?? "grid" }) });

    const q = useDeferredValue(search.q);
    const status = useDeferredValue(search.status);
    const sort = useDeferredValue(search.sort);

    const { data: rooms } = useSuspenseQuery({
        ...roomQueries.list({ status, q, sort }),
        select: selectRoomCollection,
    });

    return (
        <RoomCollectionShell roomCount={rooms.length}>
            <RoomCollectionRenderer rooms={rooms} view={search.view} />
        </RoomCollectionShell>
    );
};

const RoomCollectionRenderer = ({
    rooms,
    view,
}: {
    rooms: ReturnType<typeof selectRoomCollection>;
    view: "list" | "grid";
}) => {
    if (rooms.length === 0) {
        return (
            <EmptyState
                icon={Building2}
                title="No rooms yet"
                description="Create your first meeting room to get started with the booking system."
            />
        );
    }

    return view === "list" ? <RoomCollectionList rooms={rooms} /> : <RoomCollectionGrid rooms={rooms} />;
};

const RoomCollectionShell = ({ children, roomCount }: { children: ReactNode; roomCount: number }) => {
    return (
        <div className="p-6">
            <RoomCollectionToolbar resultCount={roomCount} />
            {children}
        </div>
    );
};
