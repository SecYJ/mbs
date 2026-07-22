import { getRouteApi } from "@tanstack/react-router";
import { Grid2X2, List } from "lucide-react";

import { cn } from "@/lib/utils";

const Route = getRouteApi("/admin/rooms");

export const RoomCollectionViewToggleButton = ({ view }: { view: "grid" | "list" }) => {
    const navigate = Route.useNavigate();
    const isActiveView = Route.useSearch({ select: (s) => (s?.view ? s.view : "grid") === view });

    return (
        <button
            type="button"
            onClick={() => navigate({ search: (prev) => ({ ...prev, view }), replace: true })}
            className={cn(
                "flex size-7 items-center justify-center rounded-md text-(--a-text-muted) transition-colors hover:text-(--a-text)",
                isActiveView && "bg-(--a-surface-2) text-(--a-text)",
            )}
        >
            {view === "grid" ? (
                <Grid2X2 className="size-3.5" strokeWidth={2} />
            ) : (
                <List className="size-3.5" strokeWidth={2} />
            )}
        </button>
    );
};
