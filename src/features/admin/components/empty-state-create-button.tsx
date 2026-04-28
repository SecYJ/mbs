import { Plus } from "lucide-react";

import { useRoomsCreateStore } from "@/features/admin/stores/rooms-create-store";

export const RoomsEmptyStateCreateButton = () => {
    const { setOpen } = useRoomsCreateStore((s) => s.actions);

    return (
        <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-accent) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--a-accent-hover)"
        >
            <Plus className="size-4" strokeWidth={2} />
            Create Room
        </button>
    );
};
