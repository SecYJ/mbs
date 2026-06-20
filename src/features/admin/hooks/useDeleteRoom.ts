import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { roomsSearchDefaults } from "@/features/admin/schema/rooms-search.schema";
import { adminBookingQueries } from "@/features/admin/services/bookings/queries";
import { deleteRoomFn } from "@/features/admin/services/rooms/fns";
import { roomQueries } from "@/features/admin/services/rooms/queries";
import { bookingCalendarQueryOptions, myBookingsQueryKey } from "@/features/bookings/services/queries";
import { notificationsQueryKey } from "@/features/notifications/services/queries";

export const useDeleteRoom = ({ roomId }: { roomId: string }) => {
    const navigate = useNavigate({ from: "/admin/rooms/$roomId" });
    const router = useRouter();
    const deleteRoomServerFn = useServerFn(deleteRoomFn);

    const { mutate: deleteSelectedRoom, isPending } = useMutation({
        mutationFn: deleteRoomServerFn,
        onSuccess: async (_1, _2, _3, context) => {
            await Promise.all([
                context.client.removeQueries(roomQueries.detail(roomId)),
                context.client.invalidateQueries({ queryKey: roomQueries.lists() }),
                context.client.invalidateQueries({ queryKey: adminBookingQueries.all() }),
                context.client.invalidateQueries(bookingCalendarQueryOptions()),
                context.client.invalidateQueries({ queryKey: myBookingsQueryKey }),
                context.client.invalidateQueries({ queryKey: notificationsQueryKey }),
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
