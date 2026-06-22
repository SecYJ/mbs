import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, Search, X } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";
import type { EditBookingFormValues } from "@/features/my-bookings/schemas/edit-booking.schema";
import { cn } from "@/lib/utils";

// Fresh attendee picker for the my-bookings editor: a search box over the
// inviteable users with toggle rows and removable chips, reading and writing
// the `attendeeIds` field through form context.
export const EditBookingAttendeesField = () => {
    const { data: inviteableUsers } = useSuspenseQuery({
        ...bookingCalendarQueries.data(),
        select: (data) => data.users,
    });

    const { control, setValue } = useFormContext<EditBookingFormValues>();
    const selectedIds = useWatch({ control, name: "attendeeIds" });

    const [query, setQuery] = useState("");

    const selectedAttendees = inviteableUsers.filter((user) => selectedIds.includes(user.id));
    const normalizedQuery = query.trim().toLowerCase();
    const matches = normalizedQuery
        ? inviteableUsers.filter(
              (user) =>
                  user.name.toLowerCase().includes(normalizedQuery) ||
                  user.email.toLowerCase().includes(normalizedQuery),
          )
        : inviteableUsers;

    const toggleAttendee = (userId: string) => {
        setValue(
            "attendeeIds",
            selectedIds.includes(userId) ? selectedIds.filter((id) => id !== userId) : [...selectedIds, userId],
        );
    };

    return (
        <div className="space-y-2">
            <Label className="eyebrow block">
                Attendees <span className="ml-1 text-(--bone-faint)">(optional)</span>
            </Label>

            {selectedAttendees.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {selectedAttendees.map((attendee) => (
                        <span
                            key={attendee.id}
                            className="inline-flex items-center gap-1 border border-(--hairline) bg-(--surface-02) px-2 py-0.5 text-[0.7rem] text-(--bone-muted)"
                        >
                            {attendee.name}
                            <button
                                type="button"
                                onClick={() => toggleAttendee(attendee.id)}
                                aria-label={`Remove ${attendee.name}`}
                                className="ml-0.5 cursor-pointer text-(--bone-dim) transition-colors hover:text-(--gold)"
                            >
                                <X className="size-3" strokeWidth={1.6} />
                            </button>
                        </span>
                    ))}
                </div>
            ) : null}

            <div className="flex items-center gap-2 border-b border-(--hairline) text-(--bone-muted) focus-within:border-(--gold)">
                <Search className="size-4 shrink-0" strokeWidth={1.4} />
                <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search people to invite"
                    className="h-10 rounded-none border-0 bg-transparent px-0 text-[0.85rem] text-(--bone) shadow-none focus-visible:ring-0 placeholder:text-(--bone-faint)"
                />
            </div>

            <div className="scrollbar-thin max-h-40 overflow-y-auto border border-(--hairline) bg-(--surface-02)">
                {matches.length === 0 ? (
                    <p className="px-3 py-3 text-[0.78rem] text-(--bone-faint)">No people match your search.</p>
                ) : (
                    matches.map((user) => {
                        const isSelected = selectedIds.includes(user.id);

                        return (
                            <button
                                key={user.id}
                                type="button"
                                onClick={() => toggleAttendee(user.id)}
                                className="flex w-full items-center justify-between gap-3 border-b border-(--hairline) px-3 py-2 text-left last:border-b-0 transition-colors hover:bg-(--surface-01)"
                            >
                                <span className="min-w-0">
                                    <span className="block truncate text-[0.84rem] text-(--bone)">{user.name}</span>
                                    <span className="block truncate text-[0.7rem] text-(--bone-dim)">{user.email}</span>
                                </span>
                                <Check
                                    className={cn(
                                        "size-4 shrink-0 transition-opacity",
                                        isSelected ? "text-(--gold) opacity-100" : "opacity-0",
                                    )}
                                    strokeWidth={1.6}
                                />
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};
