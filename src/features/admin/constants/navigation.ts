import { linkOptions } from "@tanstack/react-router";
import { Building2, CalendarDays, Users } from "lucide-react";

import { ADMIN_BOOKING_SEARCH_DEFAULTS } from "@/features/admin/schema/bookings-search.schema";
import { roomsSearchDefaults } from "@/features/admin/schema/rooms-search.schema";
import { usersSearchDefaults } from "@/features/admin/schema/users-search.schema";

export const adminNavItems = linkOptions([
    {
        label: "Rooms",
        icon: Building2,
        to: "/admin/rooms",
        search: roomsSearchDefaults,
        activeOptions: {
            includeSearch: false,
        },
    },
    {
        label: "Users",
        icon: Users,
        to: "/admin/users",
        search: usersSearchDefaults,
        activeOptions: {
            includeSearch: false,
        },
    },
    {
        label: "All Bookings",
        icon: CalendarDays,
        to: "/admin/bookings",
        search: ADMIN_BOOKING_SEARCH_DEFAULTS,
        activeOptions: {
            includeSearch: false,
        },
    },
]);
