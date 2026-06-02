import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Plus, Wrench } from "lucide-react";

import { EmptyState } from "@/features/admin/components/empty-state";
import { CreateEquipmentDialog } from "@/features/admin/components/create-equipment-dialog";
import { EquipmentRow } from "@/features/admin/components/equipment-row";
import { EquipmentPageHeader } from "@/features/admin/components/equipment-page-header";
import { equipmentQueryOptions } from "@/features/admin/services/equipment/queries";
import { EquipmentCreateStoreProvider, useEquipmentCreateStore } from "@/features/admin/stores/equipment-create-store";
import { cn } from "@/lib/utils";

type SortField = "name" | "brand" | "price";
type SortDirection = "asc" | "desc";

const EquipmentSortIndicator = ({ field, sort, dir }: { field: SortField; sort?: SortField; dir?: SortDirection }) => {
    if (sort !== field || !dir) return null;

    return <span className="ml-1 inline-block text-[0.5rem] text-(--a-accent)">{dir === "asc" ? "▲" : "▼"}</span>;
};

const EquipmentSortHeader = ({
    field,
    label,
    width,
    align,
    sort,
    dir,
    onSort,
}: {
    field: SortField;
    label: string;
    width: string;
    align?: "right";
    sort?: SortField;
    dir?: SortDirection;
    onSort: (field: SortField) => void;
}) => (
    <th
        data-sortable
        style={{ width, textAlign: align }}
        aria-sort={sort === field && dir ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
        <button
            type="button"
            onClick={() => onSort(field)}
            className={cn(
                "flex w-full items-center gap-1 font-inherit",
                align === "right" ? "justify-end" : "text-left",
            )}
        >
            {label}
            <EquipmentSortIndicator field={field} sort={sort} dir={dir} />
        </button>
    </th>
);

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
    const normalizedQ = q.trim();

    let filtered = items;
    if (normalizedQ) {
        const needle = normalizedQ.toLowerCase();
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
                    icon={Wrench}
                    title="No equipment yet"
                    description="Add equipment that can be assigned to meeting rooms."
                    action={<EmptyStateButton />}
                />
            ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-(--a-text-muted)">No equipment matches "{normalizedQ}"</p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-(--a-border-hover) bg-(--a-surface-0)">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <EquipmentSortHeader
                                    sort={sort}
                                    dir={dir}
                                    onSort={toggleSort}
                                    field="name"
                                    label="Name"
                                    width="54%"
                                />
                                <EquipmentSortHeader
                                    sort={sort}
                                    dir={dir}
                                    onSort={toggleSort}
                                    field="brand"
                                    label="Brand"
                                    width="24%"
                                />
                                <EquipmentSortHeader
                                    sort={sort}
                                    dir={dir}
                                    onSort={toggleSort}
                                    field="price"
                                    label="Price"
                                    width="22%"
                                    align="right"
                                />
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
