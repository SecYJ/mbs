import { format, isBefore, isSameDay, startOfDay } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, FormStateSubscribe, Watch } from "react-hook-form";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ReservationAttendees } from "@/features/bookings/components/reservation/ReservationAttendees";
import { ReservationFormActions } from "@/features/bookings/components/reservation/ReservationFormActions";
import { ReservationRoomField } from "@/features/bookings/components/reservation/ReservationRoomField";
import { useReservationForm } from "@/features/bookings/hooks/reservation/useReservationForm";
import { cn } from "@/lib/utils";

export const ReservationForm = () => {
    const { form, isExistingBooking, minimumStartTime, error, submitReservation } = useReservationForm();

    return (
        <FormProvider {...form}>
            <div>
                <p className="eyebrow text-(--gold)">{isExistingBooking ? "Edit Reservation" : "New Reservation"}</p>
                <h2 className="display-italic mt-2 text-[1.75rem] leading-[1.05] font-normal text-(--bone)">
                    {isExistingBooking ? "Update the booking." : "Reserve a room."}
                </h2>
                <p className="mt-2 text-[0.78rem] text-(--bone-muted)">
                    {isExistingBooking
                        ? "Adjust the room, time, attendees, or notes for this reservation."
                        : "Enter the details below to add a booking to the ledger."}
                </p>
            </div>

            <form onSubmit={submitReservation} className="mt-4 space-y-6 border-t border-(--hairline) pt-6">
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

                <ReservationRoomField />

                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <Controller
                        name="startTime"
                        render={({ field }) => (
                            <ReservationDateTimeField
                                label="Start Time"
                                min={minimumStartTime}
                                placement="start"
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <Controller
                        name="endTime"
                        render={({ field }) => (
                            <Watch
                                control={form.control}
                                name="startTime"
                                compute={(startTime) =>
                                    startTime && startTime > minimumStartTime ? startTime : minimumStartTime
                                }
                                render={(minimumEndTime) => (
                                    <ReservationDateTimeField
                                        label="End Time"
                                        min={minimumEndTime}
                                        placement="end"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        )}
                    />
                </div>

                <ReservationAttendees />

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
                    control={form.control}
                    render={({ errors, isValid }) => {
                        const formError =
                            [...Object.values(errors).map((fieldError) => fieldError?.message), error].find(Boolean) ??
                            null;

                        return (
                            <>
                                {formError ? (
                                    <p className="border border-red-400/30 bg-red-500/10 px-3 py-2 text-[0.75rem] text-red-200">
                                        {formError}
                                    </p>
                                ) : null}

                                <ReservationFormActions submitDisabled={!isValid} />
                            </>
                        );
                    }}
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

const ReservationDateTimeField = ({
    label,
    min,
    placement,
    value,
    onChange,
}: {
    label: string;
    min?: string;
    placement: "start" | "end";
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
        placement === "start"
            ? {
                  label: "col-span-2 col-start-1 row-start-1",
                  date: "col-start-1 row-start-2",
              }
            : {
                  label: "col-span-2 col-start-3 row-start-1",
                  date: "col-start-3 row-start-2",
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
                    <span className="tabular-num truncate">
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
