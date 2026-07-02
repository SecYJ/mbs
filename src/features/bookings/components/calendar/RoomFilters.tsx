import { useRoomFilters } from "@/features/bookings/hooks/calendar/useRoomFilters";
import { cn } from "@/lib/utils";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";
import { useSuspenseQuery } from "@tanstack/react-query";

type RoomFiltersProps = {
    onOpenChange: (open: boolean) => void;
};

export const RoomFilters = ({ onOpenChange }: RoomFiltersProps) => {
    const filters = useRoomFilters({ onOpenChange });

    const {
        data: { allEquipment, allLocations },
    } = useSuspenseQuery(bookingCalendarQueries.roomCatalog());

    return (
        <>
            <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-6">
                    <BookingFilterGroup label="Minimum Capacity">
                        {[0, 4, 6, 8, 12, 20].map((n) => (
                            <BookingFilterChoice
                                key={n}
                                active={filters.draft.capacity === n}
                                onClick={() => filters.setDraftCapacity(n)}
                            >
                                {n === 0 ? "Any" : `${n}+`}
                            </BookingFilterChoice>
                        ))}
                    </BookingFilterGroup>
                    <BookingFilterGroup label="Equipment">
                        {allEquipment.length === 0 ? (
                            <p className="text-[0.72rem] text-(--bone-dim)">No equipment assigned yet.</p>
                        ) : (
                            allEquipment.map((item) => (
                                <BookingFilterChoice
                                    key={item}
                                    active={filters.draft.equipment.includes(item)}
                                    onClick={() => filters.toggleDraftFilter("equipment", item)}
                                >
                                    {item}
                                </BookingFilterChoice>
                            ))
                        )}
                    </BookingFilterGroup>
                    <BookingFilterGroup label="Location">
                        {allLocations.length === 0 ? (
                            <p className="text-[0.72rem] text-(--bone-dim)">No locations available yet.</p>
                        ) : (
                            allLocations.map((item) => (
                                <BookingFilterChoice
                                    key={item}
                                    active={filters.draft.location.includes(item)}
                                    onClick={() => filters.toggleDraftFilter("location", item)}
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
                    confirm
                </button>
            </div>
        </>
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
