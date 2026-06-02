import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { bookingCalendarSearchDefaults } from "@/features/bookings/schemas/booking-calendar-search.schema";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import { getFilteredRoomCount, getRoomFilterState, sortStrings } from "@/features/bookings/utils/booking-calendar";

const bookingsRoute = getRouteApi("/_bookings/bookings");

export const useBookingRoomFilters = () => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const navigate = bookingsRoute.useNavigate();
    const { capacity, equipment, location } = bookingsRoute.useSearch();
    const [open, setOpen] = useState(false);
    const [draftCapacity, setDraftCapacity] = useState(capacity);
    const [draftEquipment, setDraftEquipment] = useState(equipment);
    const [draftLocation, setDraftLocation] = useState(location);

    const activeFilterCount = (capacity > 0 ? 1 : 0) + (equipment.length > 0 ? 1 : 0) + (location.length > 0 ? 1 : 0);
    const hasActiveFilters = activeFilterCount > 0;
    const allEquipment = sortStrings(Array.from(new Set(data.rooms.flatMap((room) => room.equipment))));
    const allLocations = sortStrings(Array.from(new Set(data.rooms.map((room) => room.location))));
    const draftRoomFilterState = getRoomFilterState({
        capacity: draftCapacity,
        equipment: draftEquipment,
        location: draftLocation,
    });
    const draftRoomsShown = getFilteredRoomCount(data.rooms, draftRoomFilterState);
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
        allEquipment,
        allLocations,
        applyDraftFilters,
        clearDraftFilters,
        draftCapacity,
        draftEquipment,
        draftLocation,
        draftRoomsShown,
        handleOpenChange,
        hasActiveFilters,
        hasDraftFilters,
        open,
        setDraftCapacity,
        totalRooms: data.rooms.length,
        toggleDraftEquipment,
        toggleDraftLocation,
    };
};
