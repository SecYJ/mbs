import type { EventInput } from "@fullcalendar/core";
import { compareAsc } from "date-fns";
import { z } from "zod";

const eventEndDateSchema = z
    .preprocess((value) => (value ? value : undefined), z.coerce.date().optional())
    .transform((date) => date ?? null)
    .catch(null);

export const isPastCalendarEvent = (event: EventInput, now = new Date()) => {
    const end = eventEndDateSchema.parse(event.end);
    return !!end && compareAsc(end, now) <= 0;
};
