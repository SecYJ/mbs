import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Plus, Wrench } from "lucide-react";

import { EmptyState } from "@/features/admin/components/empty-state";
import { CreateEquipmentDialog } from "@/features/admin/components/create-equipment-dialog";
import { EquipmentRow } from "@/features/admin/components/equipment-row";
import { EquipmentPageHeader } from "@/features/admin/components/equipment-page-header";
import { equipmentQueryOptions } from "@/features/admin/services/equipment/queries";
import {
    EquipmentCreateStoreProvider,
    useEquipmentCreateStore,
} from "@/features/admin/stores/equipment-create-store";

type SortField = "name" | "brand" | "price";

export const EquipmentPage = () => {
    return (
        <EquipmentCreateStoreProvider>
            <CreateEquipmentDialog />
            <EquipmentPageHeader />
            <EquipmentContent />
        </EquipmentCreateStoreProvider>
    );
};

const EquipmentContent = () => {
    const { data: items } = useSuspenseQuery(equipmentQueryOptions());
    const { q = "", sort, dir, expanded } = useSearch({ from: "/admin/equipment" });
    const navigate = useNavigate({ from: "/admin/equipment" });

    let filtered = items;
    if (q) {
        const needle = q.toLowerCase();
        filtered = filtered.filter(
            (i) =>
                i.name.toLowerCase().includes(needle) ||
                i.brand.toLowerCase().includes(needle) ||
                i.model.toLowerCase().includes(needle),
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

    const SortHeader = ({ field, label, width, align }: { field: SortField; label: string; width: string; align?: "right" }) => (
        <th style={{ width, textAlign: align }}>
            <button
                type="button"
                data-sortable
                onClick={() => toggleSort(field)}
                className={`flex w-full items-center gap-1 font-inherit ${align === "right" ? "justify-end" : "text-left"}`}
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
                    icon={Wrench}
                    title="No equipment yet"
                    description="Add equipment that can be assigned to meeting rooms."
                    action={<EmptyStateButton />}
                />
            ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-(--a-text-muted)">No equipment matches "{q}"</p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-(--a-border-hover) bg-(--a-surface-0)">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <SortHeader field="name" label="Name" width="48%" />
                                <SortHeader field="brand" label="Brand" width="22%" />
                                <SortHeader field="price" label="Price" width="18%" align="right" />
                                <th style={{ width: "12%" }} />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => {
                                const isExpanded = expanded === item.id;
                                return (
                                    <EquipmentRow
                                        key={item.id}
                                        item={item}
                                        isExpanded={isExpanded}
                                        onToggleExpand={() => setExpanded(isExpanded ? null : item.id)}
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

const EmptyStateButton = () => {
    const { setOpen } = useEquipmentCreateStore((s) => s.actions);

    return (
        <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-accent) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--a-accent-hover)"
        >
            <Plus className="size-4" strokeWidth={2} />
            New Equipment
        </button>
    );
};
