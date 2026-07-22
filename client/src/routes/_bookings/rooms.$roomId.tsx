import { createFileRoute, notFound, redirect, stripSearchParams } from "@tanstack/react-router";
import z from "zod";

import { RoomNotFound } from "@/features/bookings/components/room-day/RoomNotFound";
import { RoomBookingDayPage } from "@/features/bookings/pages/RoomBookingDayPage";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";

export const Route = createFileRoute("/_bookings/rooms/$roomId")({
    validateSearch: z.object({
        date: z.iso.date().optional().catch(undefined),
        bookingId: z.uuid().optional().catch(undefined),
    }),
    search: {
        middlewares: [stripSearchParams({ bookingId: undefined, date: undefined })],
    },
    beforeLoad: async ({ context: { queryClient }, params: { roomId } }) => {
        const room = await queryClient.ensureQueryData(bookingCalendarQueries.room(roomId));

        if (!room) {
            throw notFound();
        }

        if (!room.available) {
            throw redirect({ to: "/bookings" });
        }
    },
    loaderDeps: (deps) => deps.search,
    loader: ({ context: { queryClient }, params: { roomId }, deps: { date } }) => {
        // Warms the reservation editor dialog (room switcher + attendee users).
        queryClient.ensureQueryData(bookingCalendarQueries.data());
        queryClient.ensureQueryData(bookingCalendarQueries.roomDayEvents({ roomId, date }));
        return queryClient.ensureQueryData(bookingCalendarQueries.room(roomId));
    },
    head: ({ loaderData }) => ({
        meta: [{ title: `${loaderData?.title ?? "Room Schedule"} | Meridian` }],
    }),
    component: RoomBookingDayPage,
    notFoundComponent: RoomNotFound,
});
