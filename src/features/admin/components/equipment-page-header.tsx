import { Plus } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { AdminHeader } from "@/features/admin/components/admin-header";
import { useEquipmentCreateStore } from "@/features/admin/stores/equipment-create-store";

export const EquipmentPageHeader = () => {
    const { q = "" } = useSearch({ from: "/admin/equipment" });
    const navigate = useNavigate({ from: "/admin/equipment" });
    const { setOpen } = useEquipmentCreateStore((s) => s.actions);

    const setSearch = (value: string) => {
        navigate({ search: (prev) => ({ ...prev, q: value }), replace: true });
    };

    return (
        <AdminHeader
            title="Equipment"
            searchPlaceholder="Search equipment..."
            searchValue={q}
            onSearchChange={setSearch}
        >
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-accent) px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-(--a-accent-hover)"
            >
                <Plus className="size-3.5" strokeWidth={2.2} />
                New Equipment
            </button>
        </AdminHeader>
    );
};
