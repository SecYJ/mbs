import { getRouteApi } from "@tanstack/react-router";

import { AdminSearchInput } from "@/features/admin/components/AdminSearchInput";

const Route = getRouteApi("/admin/rooms");

export const RoomCollectionSearchInput = () => {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    return (
        <AdminSearchInput
            value={search.q}
            onChange={(value) =>
                navigate({
                    search: (prev) => ({ ...prev, q: value.trim() || undefined }),
                    replace: true,
                })
            }
            placeholder="Search rooms..."
        />
    );
};
