import { useState } from "react";
import { LegendList } from "@legendapp/list/react";
import { Search, X } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BOOKING_RESERVATION_DIALOG_CLASS } from "@/features/bookings/components/booking-reservation-editor.constants";
import type { BookableUser } from "@/features/bookings/components/booking-reservation-editor.types";

interface BookingAttendeePickerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    users: BookableUser[];
    selectedIds: string[];
    onCommit: (ids: string[]) => void;
}

export const BookingAttendeePickerDialog = ({
    open,
    onOpenChange,
    users,
    selectedIds,
    onCommit,
}: BookingAttendeePickerDialogProps) => {
    const [search, setSearch] = useState("");
    const [draftIds, setDraftIds] = useState(() => selectedIds);

    const normalizedSearch = search.trim().toLowerCase();
    const filteredUsers =
        normalizedSearch.length === 0
            ? users
            : users.filter(
                  (user) =>
                      user.name.toLowerCase().includes(normalizedSearch) ||
                      user.email.toLowerCase().includes(normalizedSearch),
              );
    const selectedUsers = users.filter((user) => draftIds.includes(user.id));

    const toggleUser = (userId: string) => {
        setDraftIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    };
    const removeUser = (userId: string) => {
        setDraftIds((prev) => prev.filter((id) => id !== userId));
    };
    const handleDone = () => {
        onCommit(draftIds);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`${BOOKING_RESERVATION_DIALOG_CLASS} sm:max-w-2xl`}>
                <DialogHeader>
                    <p className="eyebrow eyebrow-gold">Invite</p>
                    <DialogTitle className="display-italic mt-2 text-[1.75rem] leading-[1.05] font-normal text-(--bone)">
                        Select attendees.
                    </DialogTitle>
                    <DialogDescription className="text-[0.78rem] text-(--bone-muted)">
                        Selected users will be attached when the booking is submitted.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4 border-t border-(--hairline) pt-6">
                    <div className="relative">
                        <Search
                            aria-hidden
                            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--bone-dim)"
                            strokeWidth={1.5}
                        />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search users..."
                            aria-label="Search users"
                            className="h-10 rounded-none border border-(--hairline) bg-(--surface-02) pr-3 pl-10 text-[0.9rem] text-(--bone) shadow-none placeholder:text-(--bone-faint) focus:border-(--gold) focus-visible:ring-0"
                        />
                    </div>

                    <div className="min-h-10 border border-(--hairline) bg-(--surface-02) px-3 py-2">
                        {selectedUsers.length === 0 ? (
                            <p className="py-1 text-[0.72rem] text-(--bone-dim)">No attendees selected.</p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {selectedUsers.map((user) => (
                                    <span
                                        key={user.id}
                                        className="inline-flex items-center gap-1 border border-(--hairline) bg-(--surface-01) px-2 py-0.5 text-[0.7rem] text-(--bone-muted)"
                                    >
                                        {user.name}
                                        <button
                                            type="button"
                                            onClick={() => removeUser(user.id)}
                                            aria-label={`Remove ${user.name}`}
                                            className="ml-0.5 cursor-pointer text-(--bone-dim) transition-colors hover:text-(--gold)"
                                        >
                                            <X className="size-3" strokeWidth={1.6} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-[min(420px,50dvh)] border border-(--hairline) bg-black/20">
                        <LegendList
                            data={filteredUsers}
                            renderItem={({ item }) => {
                                const checked = draftIds.includes(item.id);
                                const inputId = `attendee-${item.id}`;
                                return (
                                    <label
                                        htmlFor={inputId}
                                        aria-label={`Invite ${item.name} (${item.email})`}
                                        className="flex min-h-14 cursor-pointer items-center gap-3 border-b border-(--hairline) px-4 py-2 transition-colors hover:bg-(--gold-wash)"
                                    >
                                        <input
                                            id={inputId}
                                            aria-label={`${item.name} ${item.email}`}
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleUser(item.id)}
                                            className="size-4 accent-(--gold)"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[0.84rem] font-medium text-(--bone)">
                                                {item.name}
                                            </span>
                                            <span className="block truncate text-[0.68rem] text-(--bone-dim)">
                                                {item.email}
                                            </span>
                                        </span>
                                    </label>
                                );
                            }}
                            keyExtractor={(user) => user.id}
                            recycleItems
                            extraData={draftIds}
                            estimatedItemSize={56}
                            getFixedItemSize={() => 56}
                            style={{ height: "100%" }}
                            ListEmptyComponent={
                                <p className="px-4 py-5 text-[0.78rem] text-(--bone-dim)">
                                    No users match your search.
                                </p>
                            }
                        />
                    </div>
                </div>

                <div className="mt-2 flex gap-3 border-t border-(--hairline) pt-5">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 cursor-pointer border border-(--hairline) py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] text-(--bone-muted) uppercase transition-all hover:border-(--hairline-strong) hover:text-(--bone)"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDone}
                        className="flex flex-1 cursor-pointer items-center justify-center border border-(--bone) bg-(--bone) py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] text-black uppercase transition-all hover:bg-white hover:tracking-[0.32em]"
                    >
                        Save selection
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
