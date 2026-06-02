import { Drawer } from "@base-ui/react/drawer";
import { SlidersHorizontal, X } from "lucide-react";

import { useBookingRoomFilters } from "@/features/bookings/hooks/useBookingRoomFilters";
import { cn } from "@/lib/utils";

export const BookingRoomFilters = () => {
    const filters = useBookingRoomFilters();

    return (
        <Drawer.Root open={filters.open} onOpenChange={filters.handleOpenChange} swipeDirection="right">
            <Drawer.Trigger
                className={cn(
                    "flex cursor-pointer items-center gap-3 border px-4 py-2 text-[0.66rem] font-semibold tracking-[0.28em] uppercase transition-all",
                    filters.hasActiveFilters
                        ? "border-(--gold) text-(--gold)"
                        : "border-(--hairline) text-(--bone-dim) hover:border-(--hairline-strong) hover:text-(--bone)",
                )}
            >
                <SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
                <span>Filters</span>
                {filters.hasActiveFilters && (
                    <span className="tabular-num inline-flex h-4 min-w-4 items-center justify-center border border-(--gold) px-1 text-[0.58rem] tracking-normal text-(--gold)">
                        {filters.activeFilterCount}
                    </span>
                )}
            </Drawer.Trigger>

            <Drawer.Portal>
                <Drawer.Backdrop className="fixed inset-0 z-60 bg-black/80 backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
                <Drawer.Popup className="fixed top-0 right-0 z-70 flex h-dvh w-full max-w-100 flex-col border-l border-(--hairline) bg-(--surface-01) outline-none transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] data-ending-style:translate-x-full data-starting-style:translate-x-full">
                    <div className="flex items-start justify-between border-b border-(--hairline) px-8 py-7">
                        <div>
                            <p className="eyebrow eyebrow-gold">Refine</p>
                            <Drawer.Title className="mt-2 display-italic text-[1.7rem] leading-none text-(--bone)">
                                Filters
                            </Drawer.Title>
                        </div>
                        <Drawer.Close
                            aria-label="Close"
                            className="flex size-8 cursor-pointer items-center justify-center border border-transparent text-(--bone-dim) transition-all hover:border-(--hairline) hover:text-(--bone)"
                        >
                            <X className="size-4" strokeWidth={1.4} />
                        </Drawer.Close>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="space-y-6">
                            <BookingFilterGroup label="Minimum Capacity">
                                {[0, 4, 6, 8, 12, 20].map((n) => (
                                    <BookingFilterChoice
                                        key={n}
                                        active={filters.draftCapacity === n}
                                        onClick={() => filters.setDraftCapacity(n)}
                                    >
                                        {n === 0 ? "Any" : `${n}+`}
                                    </BookingFilterChoice>
                                ))}
                            </BookingFilterGroup>

                            <BookingFilterGroup label="Equipment">
                                {filters.allEquipment.length === 0 ? (
                                    <p className="text-[0.72rem] text-(--bone-dim)">No equipment assigned yet.</p>
                                ) : (
                                    filters.allEquipment.map((item) => (
                                        <BookingFilterChoice
                                            key={item}
                                            active={filters.draftEquipment.includes(item)}
                                            onClick={() => filters.toggleDraftEquipment(item)}
                                        >
                                            {item}
                                        </BookingFilterChoice>
                                    ))
                                )}
                            </BookingFilterGroup>

                            <BookingFilterGroup label="Location">
                                {filters.allLocations.length === 0 ? (
                                    <p className="text-[0.72rem] text-(--bone-dim)">No locations available yet.</p>
                                ) : (
                                    filters.allLocations.map((item) => (
                                        <BookingFilterChoice
                                            key={item}
                                            active={filters.draftLocation.includes(item)}
                                            onClick={() => filters.toggleDraftLocation(item)}
                                        >
                                            {item}
                                        </BookingFilterChoice>
                                    ))
                                )}
                            </BookingFilterGroup>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-(--hairline) px-8 py-5">
                        <button
                            type="button"
                            onClick={filters.clearDraftFilters}
                            disabled={!filters.hasDraftFilters}
                            className="cursor-pointer px-3 py-2 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-(--bone-dim) transition-colors hover:text-(--bone) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-(--bone-dim)"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={filters.applyDraftFilters}
                            className="group flex flex-1 cursor-pointer items-center justify-center gap-2 border border-(--bone) bg-(--bone) py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-black transition-all hover:bg-white hover:tracking-[0.32em]"
                        >
                            <span>Show</span>
                            <span className="tabular-num tracking-normal">
                                {filters.draftRoomsShown} / {filters.totalRooms}
                            </span>
                            <span>rooms</span>
                        </button>
                    </div>
                </Drawer.Popup>
            </Drawer.Portal>
        </Drawer.Root>
    );
};

const BookingFilterGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-4 border-t border-(--hairline) pt-6 first:border-t-0 first:pt-0">
        <p className="eyebrow">{label}</p>
        <div className="flex flex-wrap gap-2">{children}</div>
    </div>
);

const BookingFilterChoice = ({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
            "cursor-pointer border px-3 py-1.5 text-[0.72rem] font-medium",
            active
                ? "border-(--bone) bg-(--bone) text-black"
                : "border-(--hairline) text-(--bone-muted) hover:border-(--hairline-strong) hover:text-(--bone)",
        )}
    >
        {children}
    </button>
);
