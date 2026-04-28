import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { EmptyState } from "@/features/admin/components/empty-state";
import { useAdminToast } from "@/features/admin/components/admin-layout";
import { Building2 } from "lucide-react";
import { CreateRoomDialog } from "@/features/admin/components/create-room-dialog";
import { EmptyStateCreateButton } from "@/features/admin/components/empty-state-create-button";
import { RoomRow, type Room } from "@/features/admin/components/room-row";
import { RoomsPageHeader } from "@/features/admin/components/rooms-page-header";
import { roomsQueryOptions } from "@/features/admin/services/rooms/queries";
import { RoomsCreateStoreProvider } from "@/features/admin/stores/rooms-create-store";

type SortField = "name" | "location" | "capacity";

export const RoomsPage = () => {
    return (
        <RoomsCreateStoreProvider>
            <CreateRoomDialog />
            <RoomsPageHeader />
            <RoomsContent />
        </RoomsCreateStoreProvider>
    );
};

const RoomsContent = () => {
    const { toast } = useAdminToast();

    const { data: rooms } = useSuspenseQuery(roomsQueryOptions());
    const { q = "", sort, dir, expanded } = useSearch({ from: "/admin/rooms" });
    const navigate = useNavigate({ from: "/admin/rooms" });

    let filtered = rooms;
    if (q) {
        const needle = q.toLowerCase();
        filtered = filtered.filter(
            (r) => r.name.toLowerCase().includes(needle) || r.location.toLowerCase().includes(needle),
        );
    }
    if (sort && dir) {
        const field: SortField = sort;
        const direction = dir;
        filtered = [...filtered].sort((a, b) => {
            const av = a[field];
            const bv = b[field];
            const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
            return direction === "asc" ? cmp : -cmp;
        });
    }

    const toggleSort = (field: SortField) => {
        navigate({
            search: (prev) => {
                if (prev.sort !== field) return { ...prev, sort: field, dir: "asc" };
                if (prev.dir === "asc") return { ...prev, sort: field, dir: "desc" };
                return { ...prev, sort: undefined, dir: undefined };
            },
            replace: true,
        });
    };

    const setExpanded = (id: string | null) => {
        navigate({
            search: (prev) => ({ ...prev, expanded: id ?? undefined }),
            replace: true,
        });
    };

    const handleVisualToggle = (room: Room) => {
        toast(`${room.name} status update is not wired up yet`, "info");
    };

    const SortIndicator = ({ field }: { field: SortField }) => {
        if (sort !== field || !dir) return null;

        return <span className="ml-1 inline-block text-[0.5rem] text-(--a-accent)">{dir === "asc" ? "▲" : "▼"}</span>;
    };

    return (
        <div className="p-6">
            {filtered.length === 0 && !q ? (
                <EmptyState
                    icon={Building2}
                    title="No rooms yet"
                    description="Create your first meeting room to get started with the booking system."
                    action={<EmptyStateCreateButton />}
                />
            ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-(--a-text-muted)">No rooms match "{q}"</p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-(--a-border-hover) bg-(--a-surface-0)">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th data-sortable onClick={() => toggleSort("name")} style={{ width: "32%" }}>
                                    Name <SortIndicator field="name" />
                                </th>
                                <th data-sortable onClick={() => toggleSort("location")} style={{ width: "30%" }}>
                                    Location <SortIndicator field="location" />
                                </th>
                                <th data-sortable onClick={() => toggleSort("capacity")} style={{ width: "14%" }}>
                                    Capacity <SortIndicator field="capacity" />
                                </th>
                                <th style={{ width: "12%" }}>Status</th>
                                <th style={{ width: "12%" }} />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((room) => {
                                const isExpanded = expanded === room.id;
                                return (
                                    <RoomRow
                                        key={room.id}
                                        room={room}
                                        isExpanded={isExpanded}
                                        onToggleExpand={() => setExpanded(isExpanded ? null : room.id)}
                                        onToggleActive={() => handleVisualToggle(room)}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
