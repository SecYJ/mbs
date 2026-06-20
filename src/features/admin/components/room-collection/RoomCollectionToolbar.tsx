import { getRouteApi } from "@tanstack/react-router";

import { RoomCollectionSearchInput } from "@/features/admin/components/room-collection/RoomCollectionSearchInput";
import { RoomCollectionSelect } from "@/features/admin/components/room-collection/RoomCollectionSelect";
import { RoomCollectionViewToggleButton } from "@/features/admin/components/room-collection/RoomCollectionViewToggleButton";
import type { RoomsSearch } from "@/features/admin/schema/rooms-search.schema";

const statusItems: Array<{ label: string; value: NonNullable<RoomsSearch["status"]> }> = [
    { label: "All rooms", value: "all" },
    { label: "Available", value: "available" },
    { label: "Disabled", value: "disabled" },
];

const sortItems: Array<{ label: string; value: NonNullable<RoomsSearch["sort"]> }> = [
    { label: "Most recent", value: "recent" },
    { label: "Name A-Z", value: "name-asc" },
    { label: "Name Z-A", value: "name-desc" },
    { label: "Capacity high", value: "capacity-desc" },
    { label: "Capacity low", value: "capacity-asc" },
    { label: "Duration high", value: "duration-desc" },
    { label: "Duration low", value: "duration-asc" },
];

const Route = getRouteApi("/admin/rooms");

export const RoomCollectionToolbar = ({ resultCount }: { resultCount: number }) => {
    const navigate = Route.useNavigate();
    const search = Route.useSearch({
        select: (s) => ({
            status: s.status ?? "all",
            sort: s.sort ?? "recent",
        }),
    });

    const updateSearch = (next: Partial<RoomsSearch>) => {
        navigate({
            search: (prev) => ({ ...prev, ...next }),
            replace: true,
        });
    };

    return (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <h2 className="text-[0.9375rem] font-semibold tracking-tight text-(--a-text)">Room collection</h2>
                <p className="mt-1 text-[0.75rem] text-(--a-text-muted)">
                    {resultCount} {resultCount === 1 ? "room" : "rooms"}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <RoomCollectionSearchInput />
                <RoomCollectionSelect
                    label="Status"
                    value={search.status}
                    items={statusItems}
                    onValueChange={(status) => updateSearch({ status })}
                />
                <RoomCollectionSelect
                    label="Sort rooms"
                    value={search.sort}
                    items={sortItems}
                    onValueChange={(sort) => updateSearch({ sort })}
                />
                <div className="inline-flex rounded-lg border border-(--a-border-hover) bg-(--a-bg) p-1">
                    <RoomCollectionViewToggleButton view="grid" />
                    <RoomCollectionViewToggleButton view="list" />
                </div>
            </div>
        </div>
    );
};
