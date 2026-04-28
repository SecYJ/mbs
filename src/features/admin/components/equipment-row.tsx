import {
    CalendarDays,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Hash,
    MoreHorizontal,
    Package,
    ShieldCheck,
    Trash2,
} from "lucide-react";

import { adminBadgeClasses, adminExpandRowClasses, adminInputClasses } from "@/features/admin/admin-classes";

export interface Equipment {
    id: string;
    name: string;
    brand: string;
    model: string;
    price: number;
    quantity: number;
    purchaseDate: string;
    warrantyExpiry: string | null;
}

const priceFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const formatPrice = (n: number) => priceFormatter.format(n);

const BRAND_PALETTES = [
    { color: "var(--a-eq-blue)", bg: "var(--a-eq-blue-bg)", border: "var(--a-eq-blue-border)" },
    { color: "var(--a-eq-violet)", bg: "var(--a-eq-violet-bg)", border: "var(--a-eq-violet-border)" },
    { color: "var(--a-eq-emerald)", bg: "var(--a-eq-emerald-bg)", border: "var(--a-eq-emerald-border)" },
    { color: "var(--a-eq-cyan)", bg: "var(--a-eq-cyan-bg)", border: "var(--a-eq-cyan-border)" },
    { color: "var(--a-eq-rose)", bg: "var(--a-eq-rose-bg)", border: "var(--a-eq-rose-border)" },
] as const;

const brandPalette = (brand: string) => {
    const sum = [...brand].reduce((a, c) => a + c.charCodeAt(0), 0);
    return BRAND_PALETTES[sum % BRAND_PALETTES.length];
};

type Props = {
    item: Equipment;
    isExpanded: boolean;
    onToggleExpand: () => void;
};

export const EquipmentRow = ({ item, isExpanded, onToggleExpand }: Props) => {
    const palette = brandPalette(item.brand);

    return (
        <>
            <tr className="cursor-pointer" onClick={onToggleExpand}>
                <td>
                    <div className="flex items-start gap-2">
                        <div
                            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md"
                            style={{ background: palette.bg, color: palette.color }}
                        >
                            <Package className="size-3.5" strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-(--a-text)">{item.name}</span>
                                {item.quantity > 1 ? (
                                    <span className="rounded-md bg-(--a-surface-2) px-1.5 py-0.5 text-[0.625rem] font-semibold tabular-nums text-(--a-text-secondary)">
                                        × {item.quantity}
                                    </span>
                                ) : null}
                                {isExpanded ? (
                                    <ChevronUp className="size-3.5 text-(--a-text-muted)" />
                                ) : (
                                    <ChevronDown className="size-3.5 text-(--a-text-muted)" />
                                )}
                            </div>
                            <div className="mt-0.5 text-[0.6875rem] text-(--a-text-muted)">{item.model}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span
                        className={adminBadgeClasses}
                        style={{
                            background: palette.bg,
                            color: palette.color,
                            border: `1px solid ${palette.border}`,
                        }}
                    >
                        {item.brand}
                    </span>
                </td>
                <td className="text-right">
                    <span className="tabular-nums font-semibold text-(--a-text)">{formatPrice(item.price)}</span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-md text-(--a-text-muted) transition-colors hover:bg-(--a-surface-2)"
                    >
                        <MoreHorizontal className="size-4" />
                    </button>
                </td>
            </tr>

            {isExpanded && (
                <tr>
                    <td colSpan={4} className="border-b border-(--a-border) bg-(--a-surface-1) p-0">
                        <div className={`${adminExpandRowClasses} px-6 py-5`}>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor={`equipment-name-${item.id}`}
                                        className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)"
                                    >
                                        Name
                                    </label>
                                    <input
                                        id={`equipment-name-${item.id}`}
                                        className={`${adminInputClasses} w-full`}
                                        defaultValue={item.name}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor={`equipment-brand-${item.id}`}
                                            className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)"
                                        >
                                            Brand
                                        </label>
                                        <input
                                            id={`equipment-brand-${item.id}`}
                                            className={`${adminInputClasses} w-full`}
                                            defaultValue={item.brand}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`equipment-model-${item.id}`}
                                            className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)"
                                        >
                                            Model
                                        </label>
                                        <input
                                            id={`equipment-model-${item.id}`}
                                            className={`${adminInputClasses} w-full`}
                                            defaultValue={item.model}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor={`equipment-price-${item.id}`}
                                            className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)"
                                        >
                                            <DollarSign className="size-3" strokeWidth={1.6} />
                                            Price
                                        </label>
                                        <input
                                            id={`equipment-price-${item.id}`}
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            className={`${adminInputClasses} w-full tabular-nums`}
                                            defaultValue={item.price}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`equipment-quantity-${item.id}`}
                                            className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)"
                                        >
                                            <Hash className="size-3" strokeWidth={1.6} />
                                            Quantity
                                        </label>
                                        <input
                                            id={`equipment-quantity-${item.id}`}
                                            type="number"
                                            step="1"
                                            min={1}
                                            className={`${adminInputClasses} w-full tabular-nums`}
                                            defaultValue={item.quantity}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor={`equipment-purchase-${item.id}`}
                                            className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)"
                                        >
                                            <CalendarDays className="size-3" strokeWidth={1.6} />
                                            Purchase Date
                                        </label>
                                        <input
                                            id={`equipment-purchase-${item.id}`}
                                            type="date"
                                            className={`${adminInputClasses} w-full tabular-nums`}
                                            defaultValue={item.purchaseDate}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`equipment-warranty-${item.id}`}
                                            className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)"
                                        >
                                            <ShieldCheck className="size-3" strokeWidth={1.6} />
                                            Warranty Expiry
                                            <span className="ml-1 text-[0.625rem] font-medium normal-case tracking-normal text-(--a-text-muted)">
                                                (optional)
                                            </span>
                                        </label>
                                        <input
                                            id={`equipment-warranty-${item.id}`}
                                            type="date"
                                            className={`${adminInputClasses} w-full tabular-nums`}
                                            defaultValue={item.warrantyExpiry ?? ""}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center gap-3 border-t border-(--a-border) pt-4">
                                <button
                                    type="button"
                                    className="rounded-lg bg-(--a-accent) px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-(--a-accent-hover)"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={onToggleExpand}
                                    className="rounded-lg bg-(--a-surface-2) px-4 py-1.5 text-xs font-medium text-(--a-text-secondary) transition-colors hover:text-(--a-text)"
                                >
                                    Cancel
                                </button>
                                <div className="flex-1" />
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-danger-subtle) px-3 py-1.5 text-xs font-medium text-(--a-danger) transition-colors"
                                >
                                    <Trash2 className="size-3" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};
