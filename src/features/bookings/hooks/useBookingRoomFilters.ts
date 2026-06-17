import { getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import { useImmer } from "use-immer";

import { bookingCalendarSearchDefaults } from "@/features/bookings/schemas/booking-calendar-search.schema";

const Route = getRouteApi("/_bookings/bookings");

export const useBookingRoomFilters = () => {
    const navigate = Route.useNavigate();
    const { capacity, equipment, location } = Route.useSearch();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useImmer({ capacity, equipment, location });

    const activeFilterCount = (capacity > 0 ? 1 : 0) + (equipment.length > 0 ? 1 : 0) + (location.length > 0 ? 1 : 0);
    const hasDraftFilters = draft.capacity > 0 || draft.equipment.length > 0 || draft.location.length > 0;

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setDraft({ capacity, equipment, location });
        }
        setOpen(nextOpen);
    };

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
        setOpen(false);
    };

    return {
        activeFilterCount,
        applyDraftFilters,
        clearDraftFilters,
        draft,
        handleOpenChange,
        hasDraftFilters,
        open,
        setDraftCapacity,
        toggleDraftFilter,
    };
};
