import { Plus } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { AdminHeader } from "@/features/admin/components/admin-header";
import { useRoomsCreateStore } from "@/features/admin/stores/rooms-create-store";

export const RoomsPageHeader = () => {
    const q = useSearch({
        from: "/admin/rooms",
        select: (s) => s.q ?? "",
    });
    const navigate = useNavigate({ from: "/admin/rooms" });
    const { setOpen } = useRoomsCreateStore((s) => s.actions);

    const setSearch = (value: string) => {
        const trimmed = value.trim();
        navigate({
            search: (prev) => ({ ...prev, q: trimmed || undefined }),
            replace: true,
        });
    };

    return (
        <AdminHeader title="Rooms" searchPlaceholder="Search rooms..." searchValue={q} onSearchChange={setSearch}>
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
