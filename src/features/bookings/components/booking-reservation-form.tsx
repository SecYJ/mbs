import { useState, type FormEvent } from "react";
import type { EventInput } from "@fullcalendar/core";
import { ArrowRight, Save } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PAST_BOOKING_START_MESSAGE } from "@/features/bookings/booking.constants";
import { BookingReservationAttendees } from "@/features/bookings/components/booking-reservation-attendees";
import type {
    BookableUser,
    BookingFormData,
    BookingReservationPrefill,
    BookingReservationRoom,
} from "@/features/bookings/components/booking-reservation-editor.types";
import { formatDateTimeLocal, getNextMinuteDate } from "@/features/bookings/utils/booking-reservation-display.utils";

interface BookingReservationFormProps {
    currentUserId?: string;
    error: string | null;
    event: EventInput | null;
    isEditing: boolean;
    isSubmitting: boolean;
    onCancel: () => void;
    onSubmit: (data: BookingFormData) => void;
    prefill: BookingReservationPrefill;
    rooms: BookingReservationRoom[];
    users: BookableUser[];
}

const getEventRoomId = (event: EventInput | null) =>
    String(event?.resourceId ?? event?.extendedProps?.resourceId ?? "");

const getEventDateTime = (value: EventInput["start"]) => {
    if (!value) return "";
    return formatDateTimeLocal(new Date(String(value)));
};

export const BookingReservationForm = ({
    currentUserId,
    error,
    event,
    isEditing,
    isSubmitting,
    onCancel,
    onSubmit,
    prefill,
    rooms,
    users,
}: BookingReservationFormProps) => {
    const initialAttendeeIds =
        isEditing && event && Array.isArray(event.extendedProps?.attendeeIds)
            ? event.extendedProps.attendeeIds.filter(
                  (id): id is string => typeof id === "string" && id !== currentUserId,
              )
            : [];

    const [title, setTitle] = useState(() => (isEditing ? (event?.title ?? "") : ""));
    const [roomId, setRoomId] = useState(() => (isEditing ? getEventRoomId(event) : (prefill.roomId ?? "")));
    const [startTime, setStartTime] = useState(() =>
        isEditing ? getEventDateTime(event?.start) : prefill.start ? formatDateTimeLocal(prefill.start) : "",
    );
    const [endTime, setEndTime] = useState(() =>
        isEditing ? getEventDateTime(event?.end) : prefill.end ? formatDateTimeLocal(prefill.end) : "",
    );
    const [description, setDescription] = useState(() =>
        isEditing && typeof event?.extendedProps?.description === "string" ? event.extendedProps.description : "",
    );
    const [attendeeIds, setAttendeeIds] = useState(() => initialAttendeeIds);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [now] = useState(() => Date.now());

    const inviteableUsers = currentUserId ? users.filter((user) => user.id !== currentUserId) : users;
    const selectedRoomId = roomId || prefill.roomId;
    const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
    const roomIsPrefilled = !isEditing && !!prefill.roomId && !!selectedRoom;
    const minimumStartTime = formatDateTimeLocal(getNextMinuteDate(new Date(now)));
    const minimumEndTime = startTime && startTime > minimumStartTime ? startTime : minimumStartTime;
    const selectedStartDate = startTime ? new Date(startTime) : null;
    const selectedEndDate = endTime ? new Date(endTime) : null;
    const timeValidationError =
        selectedStartDate && selectedStartDate.getTime() <= now
            ? PAST_BOOKING_START_MESSAGE
            : selectedStartDate && selectedEndDate && selectedEndDate.getTime() <= selectedStartDate.getTime()
              ? "End time must be after start time"
              : null;
    const formError = validationError ?? timeValidationError ?? error;
    const submitLabel = isEditing ? (isSubmitting ? "Saving" : "Save") : isSubmitting ? "Reserving" : "Reserve";

    const clearValidationError = () => {
        setValidationError(null);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title || !roomId || !startTime || !endTime || isSubmitting) return;

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start.getTime() <= Date.now()) {
            setValidationError(PAST_BOOKING_START_MESSAGE);
            return;
        }

        if (end.getTime() <= start.getTime()) {
            setValidationError("End time must be after start time");
            return;
        }

        onSubmit({
            title,
            roomId,
            start,
            end,
            attendeeIds: attendeeIds.filter((id) => id !== currentUserId),
            description,
        });
    };

    return (
        <>
            <div>
                <p className="eyebrow eyebrow-gold">{isEditing ? "Edit Reservation" : "New Reservation"}</p>
                <h2 className="display-italic mt-2 text-[1.75rem] leading-[1.05] font-normal text-(--bone)">
                    {isEditing ? "Update the booking." : "Reserve a room."}
                </h2>
                <p className="mt-2 text-[0.78rem] text-(--bone-muted)">
                    {isEditing
                        ? "Adjust the room, time, attendees, or notes for this reservation."
                        : "Enter the details below to add a booking to the ledger."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-6 border-t border-(--hairline) pt-6">
                <div className="space-y-2">
                    <Label className="eyebrow block">Meeting Title</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Sprint Planning"
                        required
                        className="login-input-underline h-10 rounded-none bg-transparent text-[0.9rem] text-(--bone) shadow-none placeholder:text-(--bone-faint) focus-visible:ring-0"
                    />
                </div>

                <BookingReservationRoomField
                    roomId={roomId}
                    roomIsPrefilled={roomIsPrefilled}
                    rooms={rooms}
                    selectedRoom={selectedRoom}
                    onRoomChange={setRoomId}
                />

                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="eyebrow block">Start Time</Label>
                        <Input
                            type="datetime-local"
                            value={startTime}
                            min={minimumStartTime}
                            onChange={(e) => {
                                setStartTime(e.target.value);
                                clearValidationError();
                            }}
                            required
                            className="login-input-underline tabular-num h-10 rounded-none bg-transparent text-[0.85rem] text-(--bone) shadow-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="eyebrow block">End Time</Label>
                        <Input
                            type="datetime-local"
                            value={endTime}
                            min={minimumEndTime}
                            onChange={(e) => {
                                setEndTime(e.target.value);
                                clearValidationError();
                            }}
                            required
                            className="login-input-underline tabular-num h-10 rounded-none bg-transparent text-[0.85rem] text-(--bone) shadow-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                </div>

                <BookingReservationAttendees
                    users={inviteableUsers}
                    selectedIds={attendeeIds}
                    onChange={setAttendeeIds}
                />

                <div className="space-y-2">
                    <Label className="eyebrow block">
                        Description <span className="ml-1 text-(--bone-faint)">(optional)</span>
                    </Label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Meeting agenda or notes..."
                        rows={3}
                        className="resize-none rounded-none border border-(--hairline) bg-(--surface-02) px-3 py-2.5 text-[0.88rem] leading-relaxed text-(--bone) shadow-none placeholder:text-(--bone-faint) focus:border-(--gold) focus-visible:ring-0"
                    />
                </div>

                {formError && (
                    <p className="border border-red-400/30 bg-red-500/10 px-3 py-2 text-[0.75rem] text-red-200">
                        {formError}
                    </p>
                )}

                <div className="flex gap-3 border-t border-(--hairline) pt-5">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1 cursor-pointer border border-(--hairline) py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] text-(--bone-muted) uppercase transition-all hover:border-(--hairline-strong) hover:text-(--bone) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !!timeValidationError}
                        className="group flex flex-1 cursor-pointer items-center justify-center gap-2 border border-(--bone) bg-(--bone) py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] text-black uppercase transition-all hover:bg-white hover:tracking-[0.32em] disabled:cursor-wait disabled:opacity-70"
                    >
                        <span>{submitLabel}</span>
                        {isEditing ? (
                            <Save className="size-4" strokeWidth={1.6} />
                        ) : (
                            <ArrowRight
                                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                strokeWidth={1.6}
                            />
                        )}
                    </button>
                </div>
            </form>
        </>
    );
};

const BookingReservationRoomField = ({
    roomId,
    roomIsPrefilled,
    rooms,
    selectedRoom,
    onRoomChange,
}: {
    roomId: string;
    roomIsPrefilled: boolean;
    rooms: BookingReservationRoom[];
    selectedRoom?: BookingReservationRoom;
    onRoomChange: (roomId: string) => void;
}) => {
    const roomSelectItems = rooms.map((room) => ({
        value: room.id,
        label: (
            <>
                <span className="font-medium">{room.title}</span>
                <span className="tabular-num ml-2 text-(--bone-dim)">
                    &middot; {room.location} &middot; {room.capacity}p
                </span>
            </>
        ),
    }));

    return (
        <div className="space-y-3">
            {roomIsPrefilled && selectedRoom ? (
                <div className="space-y-2">
                    <p className="eyebrow block">Room</p>
                    <div className="border border-(--hairline) bg-(--surface-02) px-3 py-2.5">
                        <span className="text-[0.9rem] font-medium text-(--bone)">{selectedRoom.title}</span>
                        <span className="tabular-num ml-2 text-[0.72rem] text-(--bone-dim)">
                            &middot; {selectedRoom.location} &middot; {selectedRoom.capacity}p
                        </span>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <Label className="eyebrow block">Room</Label>
                    <Select
                        value={roomId}
                        onValueChange={(value) => onRoomChange(value ?? "")}
                        items={roomSelectItems}
                        required
                    >
                        <SelectTrigger className="h-10 rounded-none border-0 border-b border-(--hairline) bg-transparent text-[0.9rem] text-(--bone) shadow-none ring-0 focus:border-(--gold) focus:ring-0 [&>svg]:text-(--bone-dim)">
                            <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-(--hairline) bg-(--surface-02)">
                            {rooms.map((room) => (
                                <SelectItem
                                    key={room.id}
                                    value={room.id}
                                    className="rounded-none text-(--bone) focus:bg-(--gold-wash) focus:text-(--bone)"
                                >
                                    <span className="font-medium">{room.title}</span>
                                    <span className="tabular-num ml-2 text-(--bone-dim)">
                                        &middot; {room.location} &middot; {room.capacity}p
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {selectedRoom && selectedRoom.equipment.length > 0 && (
                <div className="space-y-2">
                    <p className="eyebrow block">Equipment</p>
                    <div className="flex flex-wrap gap-1.5">
                        {selectedRoom.equipment.map((item) => (
                            <span
                                key={item}
                                className="border border-(--hairline) px-2 py-0.5 text-[0.66rem] tracking-[0.08em] text-(--bone-dim) uppercase"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
