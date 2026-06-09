import { CreateRoomDialog } from "@/features/admin/components/create-room-dialog";
import { RoomsPageHeader } from "@/features/admin/components/rooms-page-header";
import { RoomCollection } from "@/features/admin/components/room-collection/RoomCollection";
import { RoomsCreateStoreProvider } from "@/features/admin/stores/rooms-create-store";

export const RoomsPage = () => {
    return (
        <RoomsCreateStoreProvider>
            <RoomsPageHeader />
            <RoomCollection />
            <CreateRoomDialog />
        </RoomsCreateStoreProvider>
    );
};
