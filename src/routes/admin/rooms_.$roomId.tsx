import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AdminPending } from "@/features/admin/components/AdminPending";
import { RoomDetailsPage } from "@/features/admin/pages/RoomDetailsPage";
import { roomQueries } from "@/features/admin/services/rooms/queries";

export const Route = createFileRoute("/admin/rooms_/$roomId")({
    params: z.object({
        roomId: z.uuid(),
    }),
    loader: ({ context: { queryClient }, params }) => {
        return queryClient.ensureQueryData(roomQueries.detail(params.roomId));
    },
    head: ({ loaderData }) => ({
        meta: [{ title: `${loaderData?.name ?? "Room Details"} | Meridian` }],
    }),
    component: RoomDetailsPage,
    pendingComponent: AdminPending,
});
