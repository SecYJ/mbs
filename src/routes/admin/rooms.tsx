import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { RoomsPage } from "@/features/admin/pages/rooms-page";
import { roomsSearchDefaults, roomsSearchSchema } from "@/features/admin/schema/rooms-search.schema";
import { roomsQueryOptions } from "@/features/admin/services/rooms/queries";

export const Route = createFileRoute("/admin/rooms")({
    validateSearch: roomsSearchSchema,
    search: {
        middlewares: [stripSearchParams(roomsSearchDefaults)],
    },
    loaderDeps: (loaderDeps) => loaderDeps.search,
    loader: ({ context: { queryClient }, deps }) => {
        queryClient.ensureQueryData(roomsQueryOptions(deps));
    },
    component: RoomsPage,
});
