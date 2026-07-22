import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
    subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type CalendarProps = Omit<ComponentProps<"div">, "onSelect"> & {
    disabled?: (date: Date) => boolean;
    mode?: "single";
    onSelect?: (date: Date | undefined) => void;
    selected?: Date;
};

const weekStartsOn = 1;
const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const getCalendarDays = (month: Date) =>
    eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn }),
    });

const getCalendarWeeks = (month: Date) => {
    const days = getCalendarDays(month);

    return Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) =>
        days.slice(weekIndex * 7, weekIndex * 7 + 7),
    );
};

export const Calendar = ({ className, disabled, onSelect, selected, ...props }: CalendarProps) => {
    const [displayMonth, setDisplayMonth] = useState(() => startOfMonth(selected ?? new Date()));
    const weeks = getCalendarWeeks(displayMonth);

    useEffect(() => {
        if (!selected) return;

        setDisplayMonth(startOfMonth(selected));
    }, [selected]);

    const handleDaySelect = (day: Date) => {
        setDisplayMonth(startOfMonth(day));
        onSelect?.(day);
    };

    return (
        <div className={cn("w-70 rounded-none border border-(--hairline) bg-(--surface-02) p-3", className)} {...props}>
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setDisplayMonth((month) => subMonths(month, 1))}
                    className="flex size-8 cursor-pointer items-center justify-center border border-(--hairline) text-(--bone-dim) transition-colors hover:border-(--hairline-strong) hover:text-(--bone)"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="size-4" strokeWidth={1.5} />
                </button>
                <p className="text-[0.72rem] font-semibold tracking-[0.22em] text-(--bone) uppercase">
                    {format(displayMonth, "MMMM yyyy")}
                </p>
                <button
                    type="button"
                    onClick={() => setDisplayMonth((month) => addMonths(month, 1))}
                    className="flex size-8 cursor-pointer items-center justify-center border border-(--hairline) text-(--bone-dim) transition-colors hover:border-(--hairline-strong) hover:text-(--bone)"
                    aria-label="Next month"
                >
                    <ChevronRight className="size-4" strokeWidth={1.5} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                    <div key={day} className="flex size-8 items-center justify-center text-[0.62rem] text-(--bone-dim)">
                        {day}
                    </div>
                ))}
                {weeks.flat().map((day) => {
                    const dayIsSelected = selected ? isSameDay(day, selected) : false;
                    const dayIsDisabled = disabled?.(day) ?? false;
                    const dayIsOutsideMonth = !isSameMonth(day, displayMonth);

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            onClick={() => handleDaySelect(day)}
                            disabled={dayIsDisabled}
                            className={cn(
                                "flex size-8 cursor-pointer items-center justify-center border border-transparent text-[0.76rem] tabular-nums transition-colors disabled:cursor-not-allowed disabled:text-(--bone-faint)",
                                dayIsOutsideMonth ? "text-(--bone-faint)" : "text-(--bone-muted)",
                                dayIsSelected
                                    ? "border-(--gold) bg-(--gold-wash-strong) text-(--bone)"
                                    : "hover:border-(--hairline) hover:bg-(--surface-03) hover:text-(--bone)",
                            )}
                            aria-pressed={dayIsSelected}
                        >
                            {format(day, "d")}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
