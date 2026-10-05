import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { roomsSearchDefaults } from "@/features/admin/schema/rooms-search.schema";
import { deleteRoomFn } from "@/features/admin/services/rooms/fns";
import { roomQueries } from "@/features/admin/services/rooms/queries";
import { invalidateBookingQueries } from "@/features/bookings/services/invalidation";

export const useDeleteRoom = ({ roomId }: { roomId: string }) => {
    const navigate = useNavigate({ from: "/admin/rooms/$roomId" });
    const router = useRouter();
    const deleteRoomServerFn = useServerFn(deleteRoomFn);

    const { mutate: deleteSelectedRoom, isPending } = useMutation({
        mutationFn: deleteRoomServerFn,
        async onSuccess(_1, _2, _3, context) {
            context.client.removeQueries(roomQueries.detail(roomId));
            await Promise.all([
                context.client.invalidateQueries({ queryKey: roomQueries.lists() }),
                invalidateBookingQueries(context.client),
            ]);

            router.invalidate();
            toast.success("Room deleted");
            navigate({ to: "/admin/rooms", search: roomsSearchDefaults });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete room");
        },
    });

    const deleteRoom = () => {
        deleteSelectedRoom({ data: { roomId } });
    };

    return { deleteRoom, isPending };
};
