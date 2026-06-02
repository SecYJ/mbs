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
type SortDirection = "asc" | "desc";

const RoomsSortIndicator = ({ field, sort, dir }: { field: SortField; sort?: SortField; dir?: SortDirection }) => {
    if (sort !== field || !dir) return null;

    return <span className="ml-1 inline-block text-[0.5rem] text-(--a-accent)">{dir === "asc" ? "▲" : "▼"}</span>;
};

const RoomsSortHeader = ({
    field,
    label,
    width,
    sort,
    dir,
    onSort,
}: {
    field: SortField;
    label: string;
    width: string;
    sort?: SortField;
    dir?: SortDirection;
    onSort: (field: SortField) => void;
}) => (
    <th
        data-sortable
        style={{ width }}
        aria-sort={sort === field && dir ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
        <button
            type="button"
            onClick={() => onSort(field)}
            className="flex w-full items-center gap-1 text-left font-inherit"
        >
            {label}
            <RoomsSortIndicator field={field} sort={sort} dir={dir} />
        </button>
    </th>
);

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
    const normalizedQ = q.trim();

    let filtered = rooms;
    if (normalizedQ) {
        const needle = normalizedQ.toLowerCase();
        filtered = filtered.filter(
            (r) => r.name.toLowerCase().includes(needle) || r.location.toLowerCase().includes(needle),
        );
    }
    if (sort && dir) {
        const field: SortField = sort;
        const direction = dir;
        filtered = [...filtered].toSorted((a, b) => {
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

    return (
        <div className="p-6">
            {filtered.length === 0 && !normalizedQ ? (
                <EmptyState
                    icon={Building2}
                    title="No rooms yet"
                    description="Create your first meeting room to get started with the booking system."
                    action={<RoomsEmptyStateCreateButton />}
                />
            ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-(--a-text-muted)">No rooms match "{normalizedQ}"</p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-(--a-border-hover) bg-(--a-surface-0)">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <RoomsSortHeader
                                    sort={sort}
                                    dir={dir}
                                    onSort={toggleSort}
                                    field="name"
                                    label="Name"
                                    width="36%"
                                />
                                <RoomsSortHeader
                                    sort={sort}
                                    dir={dir}
                                    onSort={toggleSort}
                                    field="location"
                                    label="Location"
                                    width="34%"
                                />
                                <RoomsSortHeader
                                    sort={sort}
                                    dir={dir}
                                    onSort={toggleSort}
                                    field="capacity"
                                    label="Capacity"
                                    width="16%"
                                />
                                <th style={{ width: "14%" }}>Status</th>
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
