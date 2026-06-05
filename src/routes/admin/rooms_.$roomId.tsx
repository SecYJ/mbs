import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RoomDetailsPage } from "@/features/admin/pages/room-details-page";
import { roomQueryOptions } from "@/features/admin/services/rooms/queries";

const roomParamsSchema = z.object({
	roomId: z.uuid(),
});

export const Route = createFileRoute("/admin/rooms_/$roomId")({
	params: roomParamsSchema,
	loader: ({ context: { queryClient }, params }) => {
		queryClient.ensureQueryData(roomQueryOptions(params.roomId));
	},
	component: RoomDetailsPage,
});
