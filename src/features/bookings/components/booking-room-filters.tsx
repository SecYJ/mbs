import { Drawer } from "@base-ui/react/drawer";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { bookingCalendarSearchDefaults } from "@/features/bookings/schemas/booking-calendar-search.schema";
import {
    type FilterableRoom,
    getFilteredRoomCount,
    getRoomFilterState,
} from "@/features/bookings/utils/booking-calendar.utils";
import { cn } from "@/lib/utils";

export const BookingRoomFilters = ({
    rooms,
    totalRooms,
    allEquipment,
    allLocations,
}: {
    rooms: FilterableRoom[];
    totalRooms: number;
    allEquipment: string[];
    allLocations: string[];
}) => {
    const navigate = useNavigate({ from: "/bookings" });
    const { capacity, equipment, location } = useSearch({ from: "/_bookings/bookings" });
    const [open, setOpen] = useState(false);
    const [draftCapacity, setDraftCapacity] = useState(capacity);
    const [draftEquipment, setDraftEquipment] = useState(equipment);
    const [draftLocation, setDraftLocation] = useState(location);

    const activeFilterCount = (capacity > 0 ? 1 : 0) + (equipment.length > 0 ? 1 : 0) + (location.length > 0 ? 1 : 0);
    const hasActiveFilters = activeFilterCount > 0;
    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setDraftCapacity(capacity);
            setDraftEquipment(equipment);
            setDraftLocation(location);
        }
        setOpen(nextOpen);
    };

    const draftRoomFilterState = getRoomFilterState({
        capacity: draftCapacity,
        equipment: draftEquipment,
        location: draftLocation,
    });
    const draftRoomsShown = getFilteredRoomCount(rooms, draftRoomFilterState);
    const hasDraftFilters = draftCapacity > 0 || draftEquipment.length > 0 || draftLocation.length > 0;
    const toggleDraftEquipment = (item: string) => {
        setDraftEquipment((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]));
    };
    const toggleDraftLocation = (item: string) => {
        setDraftLocation((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]));
    };
    const clearDraftFilters = () => {
        setDraftCapacity(bookingCalendarSearchDefaults.capacity);
        setDraftEquipment(bookingCalendarSearchDefaults.equipment);
        setDraftLocation(bookingCalendarSearchDefaults.location);
    };
    const applyDraftFilters = () => {
        navigate({
            search: (prev) => ({
                ...prev,
                capacity: draftCapacity,
                equipment: draftEquipment,
                location: draftLocation,
            }),
            replace: true,
        });
        setOpen(false);
    };

    return (
        <Drawer.Root open={open} onOpenChange={handleOpenChange} swipeDirection="right">
            <Drawer.Trigger
                className={cn(
                    "flex cursor-pointer items-center gap-3 border px-4 py-2 text-[0.66rem] font-semibold tracking-[0.28em] uppercase transition-all",
                    hasActiveFilters
                        ? "border-[var(--gold)] text-[var(--gold)]"
                        : "border-[var(--hairline)] text-[var(--bone-dim)] hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]",
                )}
            >
                <SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
                <span>Filters</span>
                {hasActiveFilters && (
                    <span className="tabular-num inline-flex h-4 min-w-4 items-center justify-center border border-[var(--gold)] px-1 text-[0.58rem] tracking-normal text-[var(--gold)]">
                        {activeFilterCount}
                    </span>
                )}
            </Drawer.Trigger>

            <Drawer.Portal>
                <Drawer.Backdrop className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-[2px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
                <Drawer.Popup className="fixed top-0 right-0 z-[70] flex h-dvh w-full max-w-[400px] flex-col border-l border-[var(--hairline)] bg-[var(--surface-01)] outline-none transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
                    <div className="flex items-start justify-between border-b border-[var(--hairline)] px-8 py-7">
                        <div>
                            <p className="eyebrow eyebrow-gold">Refine</p>
                            <Drawer.Title className="mt-2 display-italic text-[1.7rem] leading-none text-[var(--bone)]">
                                Filters
                            </Drawer.Title>
                        </div>
                        <Drawer.Close
                            aria-label="Close"
                            className="flex size-8 cursor-pointer items-center justify-center border border-transparent text-[var(--bone-dim)] transition-all hover:border-[var(--hairline)] hover:text-[var(--bone)]"
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
                                        active={draftCapacity === n}
                                        onClick={() => setDraftCapacity(n)}
                                    >
                                        {n === 0 ? "Any" : `${n}+`}
                                    </BookingFilterChoice>
                                ))}
                            </BookingFilterGroup>

                            <BookingFilterGroup label="Equipment">
                                {allEquipment.length === 0 ? (
                                    <p className="text-[0.72rem] text-[var(--bone-dim)]">No equipment assigned yet.</p>
                                ) : (
                                    allEquipment.map((item) => (
                                        <BookingFilterChoice
                                            key={item}
                                            active={draftEquipment.includes(item)}
                                            onClick={() => toggleDraftEquipment(item)}
                                        >
                                            {item}
                                        </BookingFilterChoice>
                                    ))
                                )}
                            </BookingFilterGroup>

                            <BookingFilterGroup label="Location">
                                {allLocations.length === 0 ? (
                                    <p className="text-[0.72rem] text-[var(--bone-dim)]">No locations available yet.</p>
                                ) : (
                                    allLocations.map((item) => (
                                        <BookingFilterChoice
                                            key={item}
                                            active={draftLocation.includes(item)}
                                            onClick={() => toggleDraftLocation(item)}
                                        >
                                            {item}
                                        </BookingFilterChoice>
                                    ))
                                )}
                            </BookingFilterGroup>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-[var(--hairline)] px-8 py-5">
                        <button
                            type="button"
                            onClick={clearDraftFilters}
                            disabled={!hasDraftFilters}
                            className="cursor-pointer px-3 py-2 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-[var(--bone-dim)] transition-colors hover:text-[var(--bone)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[var(--bone-dim)]"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={applyDraftFilters}
                            className="group flex flex-1 cursor-pointer items-center justify-center gap-2 border border-[var(--bone)] bg-[var(--bone)] py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-black transition-all hover:bg-white hover:tracking-[0.32em]"
                        >
                            <span>Show</span>
                            <span className="tabular-num tracking-normal">
                                {draftRoomsShown} / {totalRooms}
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
    <div className="border-t border-[var(--hairline)] pt-6 space-y-4 first:border-t-0 first:pt-0">
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
        className={cn(
            "cursor-pointer border px-3 py-1.5 text-[0.72rem] font-medium",
            active
                ? "border-[var(--bone)] bg-[var(--bone)] text-black"
                : "border-[var(--hairline)] text-[var(--bone-muted)] hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]",
        )}
    >
        {children}
    </button>
);
