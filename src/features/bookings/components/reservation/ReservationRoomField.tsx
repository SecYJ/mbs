import { useSuspenseQuery } from "@tanstack/react-query";
import { useController, useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReservationFormValues } from "@/features/bookings/hooks/reservation/useReservationForm";
import { bookingCalendarQueries } from "@/features/bookings/services/queries";

export const ReservationRoomField = () => {
    const { control } = useFormContext<ReservationFormValues>();
    const { field } = useController({ control, name: "roomId" });

    const { data: rooms } = useSuspenseQuery({
        ...bookingCalendarQueries.data(),
        select: (data) => data.rooms,
    });

    const roomSelectItems = rooms.map((room) => ({
        value: room.id,
        label: (
            <>
                <span className="font-medium">{room.title}</span>
                <span className="tabular-num ml-2 text-(--bone-dim)">
                    &middot; {room.location} &middot; {room.capacity}p &middot; max {room.maxBookingDurationHours}h
                </span>
            </>
        ),
    }));

    return (
        <div className="space-y-2">
            <Label className="eyebrow block">Room</Label>
            <Select
                value={field.value}
                onValueChange={(value) => {
                    if (!value) return;

                    field.onChange(value);
                }}
                items={roomSelectItems}
                required
            >
                <SelectTrigger className="h-10 w-full rounded-none border-0 border-b border-(--hairline) bg-transparent text-[0.9rem] text-(--bone) shadow-none ring-0 focus:border-(--gold) focus:ring-0 [&>svg]:text-(--bone-dim)">
                    <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent className="w-(--anchor-width) rounded-none border-(--hairline) bg-(--surface-02)">
                    {rooms.map((room) => (
                        <SelectItem
                            key={room.id}
                            value={room.id}
                            className="rounded-none text-(--bone) focus:bg-(--gold-wash) focus:text-(--bone)"
                        >
                            <span className="font-medium">{room.title}</span>
                            <span className="tabular-num ml-2 text-(--bone-dim)">
                                &middot; {room.location} &middot; {room.capacity}p &middot; max{" "}
                                {room.maxBookingDurationHours}h
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
