import { useState } from "react";
import { keepPreviousData, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { bookingCalendarSearchDefaults } from "@/features/bookings/schemas/booking-calendar-search.schema";
import { bookingCalendarRoomsQueryOptions } from "@/features/bookings/services/queries";

const Route = getRouteApi("/_bookings/bookings");

export const useBookingRoomFilters = () => {
    const navigate = Route.useNavigate();
    const { capacity, equipment, location } = Route.useSearch();
    const [open, setOpen] = useState(false);
    const [draftCapacity, setDraftCapacity] = useState(capacity);
    const [draftEquipment, setDraftEquipment] = useState(equipment);
    const [draftLocation, setDraftLocation] = useState(location);

    const { data } = useSuspenseQuery(bookingCalendarRoomsQueryOptions({ capacity, equipment, location }));
    // The draft selection previews its match count straight from the server;
    // applying the draft then reuses the already-cached query.
    const { data: draftData } = useQuery({
        ...bookingCalendarRoomsQueryOptions({
            capacity: draftCapacity,
            equipment: draftEquipment,
            location: draftLocation,
        }),
        placeholderData: keepPreviousData,
    });

    const activeFilterCount = (capacity > 0 ? 1 : 0) + (equipment.length > 0 ? 1 : 0) + (location.length > 0 ? 1 : 0);
    const hasActiveFilters = activeFilterCount > 0;
    const hasDraftFilters = draftCapacity > 0 || draftEquipment.length > 0 || draftLocation.length > 0;

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setDraftCapacity(capacity);
            setDraftEquipment(equipment);
            setDraftLocation(location);
        }
        setOpen(nextOpen);
    };

    const toggleDraftEquipment = (item: string) => {
        setDraftEquipment((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]));
    };

    const toggleDraftLocation = (item: string) => {
        setDraftLocation((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]));
    };

    const clearDraftFilters = () => {
        setDraftCapacity(bookingCalendarSearchDefaults.capacity);
        setDraftEquipment([...bookingCalendarSearchDefaults.equipment]);
        setDraftLocation([...bookingCalendarSearchDefaults.location]);
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

    return {
        activeFilterCount,
        allEquipment: data.allEquipment,
        allLocations: data.allLocations,
        applyDraftFilters,
        clearDraftFilters,
        draftCapacity,
        draftEquipment,
        draftLocation,
        draftRoomsShown: draftData?.rooms.length ?? 0,
        handleOpenChange,
        hasActiveFilters,
        hasDraftFilters,
        open,
        setDraftCapacity,
        totalRooms: data.totalRoomCount,
        toggleDraftEquipment,
        toggleDraftLocation,
    };
};
