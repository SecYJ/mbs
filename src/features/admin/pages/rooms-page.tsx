import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { EmptyState } from "@/features/admin/components/empty-state";
import { Building2 } from "lucide-react";
import { CreateRoomDialog } from "@/features/admin/components/create-room-dialog";
import { RoomsEmptyStateCreateButton } from "@/features/admin/components/empty-state-create-button";
import { RoomRow } from "@/features/admin/components/room-row";
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

    const SortIndicator = ({ field }: { field: SortField }) => {
        if (sort !== field || !dir) return null;

        return <span className="ml-1 inline-block text-[0.5rem] text-(--a-accent)">{dir === "asc" ? "▲" : "▼"}</span>;
    };

    const SortHeader = ({ field, label, width }: { field: SortField; label: string; width: string }) => (
        <th style={{ width }}>
            <button
                type="button"
                data-sortable
                onClick={() => toggleSort(field)}
                className="flex w-full items-center gap-1 text-left font-inherit"
            >
                {label}
                <SortIndicator field={field} />
            </button>
        </th>
    );

    return (
        <div className="p-6">
            {filtered.length === 0 && !q ? (
                <EmptyState
                    icon={Building2}
                    title="No rooms yet"
                    description="Create your first meeting room to get started with the booking system."
                    action={<RoomsEmptyStateCreateButton />}
                />
            ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-(--a-text-muted)">No rooms match "{q}"</p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-(--a-border-hover) bg-(--a-surface-0)">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <SortHeader field="name" label="Name" width="32%" />
                                <SortHeader field="location" label="Location" width="30%" />
                                <SortHeader field="capacity" label="Capacity" width="14%" />
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
