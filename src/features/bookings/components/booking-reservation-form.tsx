import type { EventInput } from "@fullcalendar/core";
import { ArrowRight, Save } from "lucide-react";
import { Controller, FormProvider, FormStateSubscribe } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BookingReservationAttendees } from "@/features/bookings/components/booking-reservation-attendees";
import type {
    BookingFormData,
    BookingReservationInitialDetails,
    BookingReservationRoom,
} from "@/features/bookings/components/booking-reservation-editor.types";
import { useBookingReservationForm } from "@/features/bookings/hooks/useBookingReservationForm";

type BookingReservationFormProps = {
    error: string | null;
    event: EventInput | null;
    initialDetails: BookingReservationInitialDetails;
    isEditing: boolean;
    isSubmitting: boolean;
    onCancel: () => void;
    onSubmit: (data: BookingFormData) => void;
    useUrlBackedAttendeeSearch?: boolean;
};

export const BookingReservationForm = ({
    error,
    event,
    initialDetails,
    isEditing,
    isSubmitting,
    onCancel,
    onSubmit,
    useUrlBackedAttendeeSearch = true,
}: BookingReservationFormProps) => {
    const reservationForm = useBookingReservationForm({
        error,
        event,
        initialDetails,
        isEditing,
        isSubmitting,
        onSubmit,
    });
    const { control } = reservationForm.form;

    return (
        <FormProvider {...reservationForm.form}>
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

            <form
                onSubmit={reservationForm.submitReservation}
                noValidate
                className="mt-4 space-y-6 border-t border-(--hairline) pt-6"
            >
                <div className="space-y-2">
                    <Label className="eyebrow block">Meeting Title</Label>
                    <Controller
                        name="title"
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="e.g. Sprint Planning"
                                required
                                className="login-input-underline h-10 rounded-none bg-transparent text-[0.9rem] text-(--bone) shadow-none placeholder:text-(--bone-faint) focus-visible:ring-0"
                            />
                        )}
                    />
                </div>

                <Controller
                    name="roomId"
                    render={({ field }) => (
                        <BookingReservationRoomField
                            roomId={field.value}
                            roomIsLockedToInitialDetails={reservationForm.roomIsLockedToInitialDetails}
                            rooms={reservationForm.rooms}
                            selectedRoom={reservationForm.selectedRoom}
                            onRoomChange={field.onChange}
                        />
                    )}
                />

                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="eyebrow block">Start Time</Label>
                        <Controller
                            name="startTime"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="datetime-local"
                                    min={reservationForm.minimumStartTime}
                                    required
                                    className="login-input-underline tabular-num h-10 rounded-none bg-transparent text-[0.85rem] text-(--bone) shadow-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="eyebrow block">End Time</Label>
                        <Controller
                            name="endTime"
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="datetime-local"
                                    min={reservationForm.minimumEndTime}
                                    required
                                    className="login-input-underline tabular-num h-10 rounded-none bg-transparent text-[0.85rem] text-(--bone) shadow-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            )}
                        />
                    </div>
                </div>

                <BookingReservationAttendees
                    inviteableUsers={reservationForm.inviteableUsers}
                    useUrlBackedSearch={useUrlBackedAttendeeSearch}
                />

                <div className="space-y-2">
                    <Label className="eyebrow block">
                        Description <span className="ml-1 text-(--bone-faint)">(optional)</span>
                    </Label>
                    <Controller
                        name="description"
                        render={({ field }) => (
                            <Textarea
                                {...field}
                                value={field.value ?? ""}
                                placeholder="Meeting agenda or notes..."
                                rows={3}
                                className="resize-none rounded-none border border-(--hairline) bg-(--surface-02) px-3 py-2.5 text-[0.88rem] leading-relaxed text-(--bone) shadow-none placeholder:text-(--bone-faint) focus:border-(--gold) focus-visible:ring-0"
                            />
                        )}
                    />
                </div>

                <FormStateSubscribe
                    control={control}
                    render={({ errors }) => {
                        const formError = reservationForm.getFormError(errors);

                        return formError ? (
                            <p className="border border-red-400/30 bg-red-500/10 px-3 py-2 text-[0.75rem] text-red-200">
                                {formError}
                            </p>
                        ) : (
                            <></>
                        );
                    }}
                />

                <BookingReservationFormActions
                    isEditing={isEditing}
                    isSubmitting={isSubmitting}
                    onCancel={onCancel}
                    submitDisabled={reservationForm.submitDisabled}
                    submitLabel={reservationForm.submitLabel}
                />
            </form>
        </FormProvider>
    );
};

const BookingReservationFormActions = ({
    isEditing,
    isSubmitting,
    onCancel,
    submitDisabled,
    submitLabel,
}: {
    isEditing: boolean;
    isSubmitting: boolean;
    onCancel: () => void;
    submitDisabled: boolean;
    submitLabel: string;
}) => (
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
            disabled={isSubmitting || submitDisabled}
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
);

const BookingReservationRoomField = ({
    roomId,
    roomIsLockedToInitialDetails,
    rooms,
    selectedRoom,
    onRoomChange,
}: {
    roomId: string;
    roomIsLockedToInitialDetails: boolean;
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
            {roomIsLockedToInitialDetails && selectedRoom ? (
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
