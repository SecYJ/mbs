import { CalendarDays, ChevronDown, ChevronUp, DollarSign, Hash, Package, ShieldCheck } from "lucide-react";

import { adminBadgeClasses, adminExpandRowClasses, adminInputClasses } from "@/features/admin/admin-classes";
import type { Equipment } from "@/features/admin/types";

export type { Equipment };

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
            <tr>
                <td>
                    <button
                        type="button"
                        onClick={onToggleExpand}
                        aria-expanded={isExpanded}
                        aria-label={`${item.name} (${item.brand} ${item.model}) — toggle details`}
                        className="flex w-full items-start gap-2 text-left"
                    >
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
                    </button>
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
                <td />
            </tr>

            {isExpanded && (
                <tr>
                    <td colSpan={4} className="border-b border-(--a-border) bg-(--a-surface-1) p-0">
                        <div className={`${adminExpandRowClasses} px-6 py-5`}>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)">
                                        Name
                                    </dt>
                                    <dd className={`${adminInputClasses} flex w-full items-center`}>{item.name}</dd>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)">
                                            Brand
                                        </dt>
                                        <dd className={`${adminInputClasses} flex w-full items-center`}>{item.brand}</dd>
                                    </div>
                                    <div>
                                        <dt className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)">
                                            Model
                                        </dt>
                                        <dd className={`${adminInputClasses} flex w-full items-center`}>{item.model}</dd>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)">
                                            <DollarSign className="size-3" strokeWidth={1.6} />
                                            Price
                                        </dt>
                                        <dd className={`${adminInputClasses} flex w-full items-center tabular-nums`}>
                                            {item.price}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)">
                                            <Hash className="size-3" strokeWidth={1.6} />
                                            Quantity
                                        </dt>
                                        <dd className={`${adminInputClasses} flex w-full items-center tabular-nums`}>
                                            {item.quantity}
                                        </dd>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)">
                                            <CalendarDays className="size-3" strokeWidth={1.6} />
                                            Purchase Date
                                        </dt>
                                        <dd className={`${adminInputClasses} flex w-full items-center tabular-nums`}>
                                            {item.purchaseDate}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-(--a-text-muted)">
                                            <ShieldCheck className="size-3" strokeWidth={1.6} />
                                            Warranty Expiry
                                            <span className="ml-1 text-[0.625rem] font-medium normal-case tracking-normal text-(--a-text-muted)">
                                                (optional)
                                            </span>
                                        </dt>
                                        <dd className={`${adminInputClasses} flex w-full items-center tabular-nums`}>
                                            {item.warrantyExpiry ?? "—"}
                                        </dd>
                                    </div>
                                </div>
                            </dl>

                            <div className="mt-5 flex items-center justify-end gap-3 border-t border-(--a-border) pt-4">
                                <button
                                    type="button"
                                    onClick={onToggleExpand}
                                    className="rounded-lg bg-(--a-surface-2) px-4 py-1.5 text-xs font-medium text-(--a-text-secondary) transition-colors hover:text-(--a-text)"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};
