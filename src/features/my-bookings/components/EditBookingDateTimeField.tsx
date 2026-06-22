import { format, isBefore, isSameDay, startOfDay } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const dateDisplayFormat = "EEE, MMM d";
const dateValueFormat = "yyyy-MM-dd";
const fallbackTimeValue = "09:00";

const timeOptions = Array.from({ length: 48 }, (_, index) => {
    const hour = Math.floor(index / 2);
    const minute = index % 2 === 0 ? "00" : "30";

    return `${String(hour).padStart(2, "0")}:${minute}`;
});

const parseDateTimeLocal = (value: string) => {
    if (!value) return undefined;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
};

const getTimePart = (value: string) => value.split("T")[1]?.slice(0, 5) || fallbackTimeValue;

const combineDateAndTime = (date: Date, time: string) =>
    `${format(date, dateValueFormat)}T${time || fallbackTimeValue}`;

// Fresh date + time picker for the my-bookings editor: a calendar popover for
// the day and a half-hour Select for the time, kept independent of the
// calendar feature's reservation form.
export const EditBookingDateTimeField = ({
    label,
    min,
    value,
    onChange,
}: {
    label: string;
    min?: string;
    value: string;
    onChange: (value: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const selectedDate = parseDateTimeLocal(value);
    const minimumDate = min ? parseDateTimeLocal(min) : undefined;
    const minimumDay = minimumDate ? startOfDay(minimumDate) : undefined;
    const timeValue = selectedDate ? format(selectedDate, "HH:mm") : "";

    const sameDayAsMinimum = selectedDate && minimumDate && isSameDay(selectedDate, minimumDate);
    const timeFloor = sameDayAsMinimum ? format(minimumDate, "HH:mm") : undefined;
    const availableTimeOptions = timeFloor ? timeOptions.filter((time) => time >= timeFloor) : timeOptions;

    const handleDateSelect = (date?: Date) => {
        if (!date) return;

        onChange(combineDateAndTime(date, getTimePart(value)));
        setOpen(false);
    };

    const handleTimeChange = (time: string | null) => {
        if (!time) return;

        onChange(combineDateAndTime(selectedDate ?? minimumDate ?? new Date(), time));
    };

    return (
        <div className="space-y-2">
            <Label className="eyebrow block">{label}</Label>
            <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-x-3">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger
                        type="button"
                        className={cn(
                            "flex h-10 min-w-0 cursor-pointer items-center gap-2 border-b border-(--hairline) bg-transparent px-0 text-left text-[0.85rem] text-(--bone) transition-colors hover:text-(--gold) focus:border-(--gold) focus:outline-none",
                            !selectedDate && "text-(--bone-faint)",
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
                <Select
                    value={timeValue}
                    onValueChange={handleTimeChange}
                    items={availableTimeOptions.map((time) => ({ label: time, value: time }))}
                >
                    <SelectTrigger
                        aria-label={`${label} time`}
                        className={cn(
                            "h-10 w-full rounded-none border-0 border-b border-(--hairline) bg-transparent px-0 text-[0.85rem] text-(--bone) shadow-none ring-0 focus:border-(--gold) focus:ring-0 data-[size=default]:h-10 [&>svg]:text-(--bone-dim)",
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
            </div>
        </div>
    );
};
