import { Plus } from "lucide-react";

import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { useRoomsCreateStore } from "@/features/admin/stores/RoomsCreateStore";

export const RoomsPageHeader = () => {
    const { setOpen } = useRoomsCreateStore((s) => s.actions);

    return (
        <AdminHeader title="Rooms">
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-accent) px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-(--a-accent-hover)"
            >
                <Plus className="size-3.5" strokeWidth={2.2} />
                New Room
            </button>
        </AdminHeader>
    );
};
