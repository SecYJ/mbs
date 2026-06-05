import { linkOptions } from "@tanstack/react-router";
import { Building2, CalendarDays, Users } from "lucide-react";

import { ADMIN_BOOKING_SEARCH_DEFAULTS } from "@/features/admin/schema/bookings-search.schema";
import { roomsSearchDefaults } from "@/features/admin/schema/rooms-search.schema";
import { usersSearchDefaults } from "@/features/admin/schema/users-search.schema";

const adminNavActiveOptions = { includeSearch: false } as const;

export const adminNavItems = linkOptions([
    {
        label: "Rooms",
        icon: Building2,
        to: "/admin/rooms",
        search: roomsSearchDefaults,
        activeOptions: adminNavActiveOptions,
    },
    {
        label: "Users",
        icon: Users,
        to: "/admin/users",
        search: usersSearchDefaults,
        activeOptions: adminNavActiveOptions,
    },
    {
        label: "All Bookings",
        icon: CalendarDays,
        to: "/admin/bookings",
        search: ADMIN_BOOKING_SEARCH_DEFAULTS,
        activeOptions: adminNavActiveOptions,
    },
]);
