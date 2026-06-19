import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { roomsSearchDefaults } from "@/features/admin/schema/rooms-search.schema";
import { adminBookingQueries } from "@/features/admin/services/bookings/queries";
import { deleteRoomFn } from "@/features/admin/services/rooms/fns";
import { roomQueries } from "@/features/admin/services/rooms/queries";
import { bookingCalendarQueryOptions, myBookingsQueryKey } from "@/features/bookings/services/queries";
import { notificationsQueryKey } from "@/features/notifications/services/queries";

type Options = {
    roomId: string;
};

export const useDeleteRoom = ({ roomId }: Options) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate({ from: "/admin/rooms/$roomId" });
    const router = useRouter();
    const deleteRoomServerFn = useServerFn(deleteRoomFn);

    const { mutate: deleteSelectedRoom, isPending } = useMutation({
        mutationFn: deleteRoomServerFn,
        onSuccess: async () => {
            await Promise.all([
                queryClient.removeQueries(roomQueries.detail(roomId)),
                queryClient.invalidateQueries({ queryKey: roomQueries.lists() }),
                queryClient.invalidateQueries({ queryKey: adminBookingQueries.all() }),
                queryClient.invalidateQueries(bookingCalendarQueryOptions()),
                queryClient.invalidateQueries({ queryKey: myBookingsQueryKey }),
                queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
            ]);

            router.invalidate();
            navigate({ to: "/admin/rooms", search: roomsSearchDefaults });
            toast.success("Room deleted");
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
