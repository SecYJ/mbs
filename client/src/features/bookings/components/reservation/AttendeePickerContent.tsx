import { LegendList } from "@legendapp/list/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import type { ReservationFormValues } from "@/features/bookings/hooks/reservation/useReservationForm";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";

type AttendeePickerContentProps = {
    onOpenChange: (open: boolean) => void;
};

export const AttendeePickerContent = ({ onOpenChange }: AttendeePickerContentProps) => {
    const { data: inviteableUsers } = useSuspenseQuery({
        ...bookingCalendarQueries.data(),
        select: ({ users }) => users,
    });

    const { control, setValue } = useFormContext<ReservationFormValues>();
    const draftIds = useWatch({ control, name: "draftAttendeeIds" });
    const [attendeeSearch, setAttendeeSearch] = useState("");

    const normalizedSearch = attendeeSearch.trim().toLowerCase();

    const filteredUsers =
        normalizedSearch.length === 0
            ? inviteableUsers
            : inviteableUsers.filter(
                  (user) =>
                      user.name.toLowerCase().includes(normalizedSearch) ||
                      user.email.toLowerCase().includes(normalizedSearch),
              );

    const selectedUsers = inviteableUsers.filter((user) => draftIds.includes(user.id));

    const toggleUser = (userId: string) => {
        setValue(
            "draftAttendeeIds",
            draftIds.includes(userId) ? draftIds.filter((id) => id !== userId) : [...draftIds, userId],
        );
    };
    const removeUser = (userId: string) => {
        setValue(
            "draftAttendeeIds",
            draftIds.filter((id) => id !== userId),
        );
    };
    const handleDone = () => {
        setValue("attendeeIds", draftIds);
        onOpenChange(false);
    };

    return (
        <>
            <div className="mt-4 space-y-4 border-t border-(--hairline) pt-6">
                <div className="relative">
                    <Search
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--bone-dim)"
                        strokeWidth={1.5}
                    />
                    <Input
                        value={attendeeSearch}
                        onChange={(e) => setAttendeeSearch(e.target.value)}
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
                        className="h-full"
                        ListEmptyComponent={
                            <p className="px-4 py-5 text-[0.78rem] text-(--bone-dim)">No users match your search.</p>
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
        </>
    );
};
