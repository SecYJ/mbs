import { CreateRoomDialog } from "@/features/admin/components/create-room-dialog";
import { RoomsPageHeader } from "@/features/admin/components/rooms-page-header";
import { RoomsCollection } from "@/features/admin/components/rooms-collection";
import { RoomsCreateStoreProvider } from "@/features/admin/stores/rooms-create-store";

export const RoomsPage = () => {
    return (
        <RoomsCreateStoreProvider>
            <CreateRoomDialog />
            <RoomsPageHeader />
            <RoomsCollection />
        </RoomsCreateStoreProvider>
    );
};
