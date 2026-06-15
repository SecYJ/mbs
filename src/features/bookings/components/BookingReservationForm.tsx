import { format, isBefore, isSameDay, startOfDay } from "date-fns";
import { ArrowRight, CalendarDays, Clock, Save } from "lucide-react";
import { Controller, FormProvider, FormStateSubscribe } from "react-hook-form";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BookingReservationAttendees } from "@/features/bookings/components/booking-reservation-attendees";
import type {
    BookingReservationEditing,
    BookingReservationInitialDetails,
    BookingReservationRoom,
} from "@/features/bookings/components/booking-reservation-editor.types";
import { useBookingReservationForm } from "@/features/bookings/hooks/useBookingReservationForm";
import { cn } from "@/lib/utils";

const emptyInitialDetails: BookingReservationInitialDetails = {};

type BookingReservationFormProps = {
    editing?: BookingReservationEditing;
    initialDetails?: BookingReservationInitialDetails;
};

export const BookingReservationForm = ({
    editing,
    initialDetails = emptyInitialDetails,
}: BookingReservationFormProps) => {
    const reservationForm = useBookingReservationForm({ editing, initialDetails });
    const { control } = reservationForm.form;
    const { isSubmitting, onCancel } = reservationForm;

    const isEditing = Boolean(editing);

    return (
        <FormProvider {...reservationForm.form}>
            <div>
                <p className="eyebrow text-(--gold)">{isEditing ? "Edit Reservation" : "New Reservation"}</p>
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
                            rooms={reservationForm.rooms}
                            onRoomChange={field.onChange}
                        />
                    )}
                />

                <div
                    className={cn(
                        "grid gap-x-4 gap-y-2",
                        reservationForm.showStartTimeField
                            ? "grid-cols-[minmax(0,1fr)_5.75rem_minmax(0,1fr)_5.75rem]"
                            : "grid-cols-[minmax(0,1fr)_5.75rem]",
                    )}
                >
                    {reservationForm.showStartTimeField ? (
                        <Controller
                            name="startTime"
                            render={({ field }) => (
                                <BookingReservationDateTimeField
                                    label="Start Time"
                                    min={reservationForm.minimumStartTime}
                                    placement="start"
                                    showStartTimeField={reservationForm.showStartTimeField}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    ) : null}
                    <Controller
                        name="endTime"
                        render={({ field }) => (
                            <BookingReservationDateTimeField
                                label="End Time"
                                min={reservationForm.minimumEndTime}
                                placement="end"
                                showStartTimeField={reservationForm.showStartTimeField}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>

                <BookingReservationAttendees inviteableUsers={reservationForm.inviteableUsers} />

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

                        if (!formError) {
                            return null;
                        }

                        return (
                            <p className="border border-red-400/30 bg-red-500/10 px-3 py-2 text-[0.75rem] text-red-200">
                                {formError}
                            </p>
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

const dateDisplayFormat = "EEE, MMM d";
const dateValueFormat = "yyyy-MM-dd";
const fallbackTimeValue = "09:00";
const timeOptions = Array.from({ length: 48 }, (_, index) => {
    const hour = Math.floor(index / 2);
    const minute = index % 2 === 0 ? "00" : "30";

    return `${String(hour).padStart(2, "0")}:${minute}`;
});

const getDateTimeValueDate = (value: string) => {
    if (!value) return undefined;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
};

const getDateTimeValueTime = (value: string) => {
    const time = value.split("T")[1]?.slice(0, 5);
    return time || fallbackTimeValue;
};

const combineDateAndTime = (date: Date, time: string) =>
    `${format(date, dateValueFormat)}T${time || fallbackTimeValue}`;

const getMinimumDate = (min?: string) => (min ? getDateTimeValueDate(min) : undefined);

const getTimeOptionMinimum = (selectedDate: Date | undefined, min?: string) => {
    const minimumDate = getMinimumDate(min);

    if (!selectedDate || !minimumDate || !isSameDay(selectedDate, minimumDate)) {
        return undefined;
    }

    return format(minimumDate, "HH:mm");
};

const BookingReservationDateTimeField = ({
    label,
    min,
    placement,
    showStartTimeField,
    value,
    onChange,
}: {
    label: string;
    min?: string;
    placement: "start" | "end";
    showStartTimeField: boolean;
    value: string;
    onChange: (value: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const selectedDate = getDateTimeValueDate(value);
    const minimumDate = getMinimumDate(min);
    const minimumDay = minimumDate ? startOfDay(minimumDate) : undefined;
    const timeValue = selectedDate ? format(selectedDate, "HH:mm") : "";
    const timeMin = getTimeOptionMinimum(selectedDate, min);
    const availableTimeOptions = timeMin ? timeOptions.filter((time) => time >= timeMin) : timeOptions;
    const timeSelectItems = availableTimeOptions.map((time) => ({ label: time, value: time }));
    const gridPlacement =
        placement === "start" && showStartTimeField
            ? {
                  label: "col-span-2 col-start-1 row-start-1",
                  date: "col-start-1 row-start-2",
                  time: "col-start-2 row-start-2",
              }
            : placement === "end" && showStartTimeField
              ? {
                    label: "col-span-2 col-start-3 row-start-1",
                    date: "col-start-3 row-start-2",
                    time: "col-start-4 row-start-2",
                }
              : {
                    label: "col-span-2 col-start-1 row-start-1",
                    date: "col-start-1 row-start-2",
                    time: "col-start-2 row-start-2",
                };

    const handleDateSelect = (date?: Date) => {
        if (!date) return;

        onChange(combineDateAndTime(date, getDateTimeValueTime(value)));
        setOpen(false);
    };

    const handleTimeChange = (time: string | null) => {
        if (!time) return;

        const date = selectedDate ?? minimumDate ?? new Date();
        onChange(combineDateAndTime(date, time));
    };

    return (
        <>
            <Label className={cn("eyebrow block", gridPlacement.label)}>{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    type="button"
                    className={cn(
                        "login-input-underline flex h-10 min-w-0 cursor-pointer items-center gap-2 rounded-none bg-transparent px-0 text-left text-[0.85rem] text-(--bone) shadow-none transition-colors hover:text-(--gold)",
                        !selectedDate && "text-(--bone-faint)",
                        gridPlacement.date,
                    )}
                >
                    <CalendarDays className="size-4 shrink-0 text-(--bone-dim)" strokeWidth={1.4} />
                    <span className="truncate tabular-num">
                        {selectedDate ? format(selectedDate, dateDisplayFormat) : "Pick date"}
                    </span>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto rounded-none border-0 bg-transparent p-0 shadow-xl">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => (minimumDay ? isBefore(date, minimumDay) : false)}
                    />
                </PopoverContent>
            </Popover>
            <Select value={timeValue} onValueChange={handleTimeChange} items={timeSelectItems}>
                <SelectTrigger
                    aria-label={`${label} time`}
                    className={cn(
                        "login-input-underline h-10 w-full rounded-none border-0 bg-transparent px-0 text-[0.85rem] text-(--bone) shadow-none ring-0 focus:border-(--gold) focus:ring-0 data-[size=default]:h-10 [&>svg]:text-(--bone-dim)",
                        !timeValue && "text-(--bone-faint)",
                        gridPlacement.time,
                    )}
                >
                    <Clock className="size-4 shrink-0 text-(--bone-dim)" strokeWidth={1.4} />
                    <SelectValue placeholder="--:--" />
                </SelectTrigger>
                <SelectContent align="end" className="max-h-64 rounded-none border-(--hairline) bg-(--surface-02)">
                    {availableTimeOptions.map((time) => (
                        <SelectItem
                            key={time}
                            value={time}
                            className="rounded-none font-mono text-[0.82rem] text-(--bone) focus:bg-(--gold-wash) focus:text-(--bone)"
                        >
                            {time}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
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
    rooms,
    onRoomChange,
}: {
    roomId: string;
    rooms: BookingReservationRoom[];
    onRoomChange: (roomId: string) => void;
}) => {
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
                value={roomId}
                onValueChange={(value) => onRoomChange(value ?? "")}
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
