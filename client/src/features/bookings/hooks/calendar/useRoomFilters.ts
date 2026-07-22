import { getRouteApi } from "@tanstack/react-router";
import { useImmer } from "use-immer";

import { bookingCalendarSearchDefaults } from "@/features/bookings/schemas/booking-calendar-search.schema";

const Route = getRouteApi("/_bookings/bookings");

export const useRoomFilters = ({ onOpenChange }: { onOpenChange: (open: boolean) => void }) => {
    const navigate = Route.useNavigate();
    const { capacity, equipment, location } = Route.useSearch();
    const [draft, setDraft] = useImmer({ capacity, equipment, location });

    const hasDraftFilters = draft.capacity > 0 || draft.equipment.length > 0 || draft.location.length > 0;

    const setDraftCapacity = (nextCapacity: number) => {
        setDraft((next) => {
            next.capacity = nextCapacity;
        });
    };

    const toggleDraftFilter = (field: "equipment" | "location", item: string) => {
        setDraft((next) => {
            const items = next[field];
            const index = items.indexOf(item);
            if (index === -1) {
                items.push(item);
            } else {
                items.splice(index, 1);
            }
        });
    };

    const clearDraftFilters = () => {
        setDraft({
            capacity: bookingCalendarSearchDefaults.capacity,
            equipment: [...bookingCalendarSearchDefaults.equipment],
            location: [...bookingCalendarSearchDefaults.location],
        });
    };

    const applyDraftFilters = () => {
        navigate({
            search: (prev) => ({ ...prev, ...draft }),
            replace: true,
        });
        onOpenChange(false);
    };

    return {
        applyDraftFilters,
        clearDraftFilters,
        draft,
        hasDraftFilters,
        setDraftCapacity,
        toggleDraftFilter,
    };
};
