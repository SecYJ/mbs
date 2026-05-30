import { linkOptions } from "@tanstack/react-router";

export const bookingNavItems = linkOptions([
    { to: "/bookings", label: "Bookings" },
    { to: "/my-bookings", label: "My Bookings" },
]);
