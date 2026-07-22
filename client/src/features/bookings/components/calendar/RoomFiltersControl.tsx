import { Drawer } from "@base-ui/react/drawer";
import { getRouteApi } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { Suspense, useState } from "react";

import { LazyRoomFilters, RoomFiltersFallback } from "@/features/bookings/components/calendar/RoomFilters.lazy";
import { cn } from "@/lib/utils";

const Route = getRouteApi("/_bookings/bookings");

export const RoomFiltersControl = () => {
    const { capacity, equipment, location } = Route.useSearch();
    const [open, setOpen] = useState(false);

    const activeFilterCount = (capacity > 0 ? 1 : 0) + (equipment.length > 0 ? 1 : 0) + (location.length > 0 ? 1 : 0);

    return (
        <Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="right">
            <Drawer.Trigger
                className={cn(
                    "flex cursor-pointer items-center gap-3 border px-4 py-2 text-[0.66rem] font-semibold tracking-[0.28em] uppercase transition-all",
                    activeFilterCount > 0
                        ? "border-(--gold) text-(--gold)"
                        : "border-(--hairline) text-(--bone-dim) hover:border-(--hairline-strong) hover:text-(--bone)",
                )}
            >
                <SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                    <span className="tabular-num inline-flex h-4 min-w-4 items-center justify-center border border-(--gold) px-1 text-[0.58rem] tracking-normal text-(--gold)">
                        {activeFilterCount}
                    </span>
                )}
            </Drawer.Trigger>

            <Drawer.Portal>
                <Drawer.Backdrop className="fixed inset-0 z-60 bg-black/80 backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
                <Drawer.Viewport>
                    <Drawer.Popup className="fixed top-0 right-0 z-70 flex h-dvh w-full max-w-100 flex-col border-l border-(--hairline) bg-(--surface-01) transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none data-ending-style:translate-x-full data-starting-style:translate-x-full">
                        <div className="flex items-start justify-between border-b border-(--hairline) px-8 py-7">
                            <div>
                                <p className="eyebrow text-(--gold)">Refine</p>
                                <Drawer.Title className="display-italic mt-2 text-[1.7rem] leading-none text-(--bone)">
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

                        <Suspense fallback={<RoomFiltersFallback />}>
                            <LazyRoomFilters onOpenChange={setOpen} />
                        </Suspense>
                    </Drawer.Popup>
                </Drawer.Viewport>
            </Drawer.Portal>
        </Drawer.Root>
    );
};
