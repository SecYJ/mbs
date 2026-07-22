import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { AdminPending } from "@/features/admin/components/AdminPending";
import { RoomsPage } from "@/features/admin/pages/RoomsPage";
import { roomsSearchDefaults, roomsSearchSchema } from "@/features/admin/schema/rooms-search.schema";
import { roomQueries } from "@/features/admin/services/rooms/queries";

export const Route = createFileRoute("/admin/rooms")({
    head: () => ({
        meta: [{ title: "Admin Rooms | Meridian" }],
    }),
    validateSearch: roomsSearchSchema,
    search: {
        middlewares: [stripSearchParams(roomsSearchDefaults)],
    },
    loaderDeps: (deps) => {
        const { q, sort, status } = deps.search;

        return { status, sort, q };
    },
    loader: ({ context: { queryClient }, deps }) => {
        queryClient.ensureQueryData(roomQueries.list(deps));
    },
    component: RoomsPage,
    pendingComponent: AdminPending,
});
