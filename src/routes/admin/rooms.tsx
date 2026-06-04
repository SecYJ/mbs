import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { RoomsPage } from "@/features/admin/pages/rooms-page";
import { roomsQueryOptions } from "@/features/admin/services/rooms/queries";
import { roomsSearchDefaults, roomsSearchSchema } from "@/features/admin/schema/rooms-search.schema";

export const Route = createFileRoute("/admin/rooms")({
    validateSearch: roomsSearchSchema,
    search: {
        middlewares: [stripSearchParams(roomsSearchDefaults)],
    },
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(roomsQueryOptions()),
    component: RoomsPage,
});
