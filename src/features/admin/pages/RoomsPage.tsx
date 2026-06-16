import { CreateRoomDialog } from "@/features/admin/components/CreateRoomDialog";
import { RoomsPageHeader } from "@/features/admin/components/RoomsPageHeader";
import { RoomCollection } from "@/features/admin/components/room-collection/RoomCollection";
import { RoomsCreateStoreProvider } from "@/features/admin/stores/RoomsCreateStore";

export const RoomsPage = () => {
    return (
        <RoomsCreateStoreProvider>
            <RoomsPageHeader />
            <RoomCollection />
            <CreateRoomDialog />
        </RoomsCreateStoreProvider>
    );
};
