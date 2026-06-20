import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { CreateRoomDialog } from "@/features/admin/components/CreateRoomDialog";
import { RoomCollection } from "@/features/admin/components/room-collection/RoomCollection";

export const RoomsPage = () => {
    return (
        <RoomsPageShell>
            <RoomCollection />
        </RoomsPageShell>
    );
};

const RoomsPageShell = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <AdminHeader title="Rooms">
                <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-(--a-accent) px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-(--a-accent-hover)"
                >
                    <Plus className="size-3.5" strokeWidth={2.2} />
                    New Room
                </button>
            </AdminHeader>

            {children}

            <CreateRoomDialog open={open} onOpenChange={setOpen} />
        </>
    );
};
