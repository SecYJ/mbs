import { format } from "date-fns";
import { z } from "zod";

const dateTimeLocalPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const toDateTimeLocal = (value: string | Date) => format(new Date(value), "yyyy-MM-dd'T'HH:mm");

const editBookingFormSchema = z.object({
    title: z.string().trim().min(1, "Meeting title is required").max(160, "Meeting title is too long"),
    roomId: z.string().min(1, "Select a room"),
    startTime: z.string().regex(dateTimeLocalPattern, "Select a valid start time"),
    endTime: z.string().regex(dateTimeLocalPattern, "Select a valid end time"),
    attendeeIds: z.string().array(),
    description: z.string().trim().max(1000, "Description is too long"),
});

export type EditBookingFormValues = z.infer<typeof editBookingFormSchema>;

type RoomPolicy = { id: string; title: string; maxBookingDurationHours: number };
type Schedule = Pick<EditBookingFormValues, "roomId" | "startTime" | "endTime">;

// Every edit rule lives here so react-hook-form surfaces them as field errors
// (no separate imperative re-check). Room policy only applies once the schedule
// actually changes, so an unrelated edit stays saveable even if the booking's
// room has since become unavailable.
export const createEditBookingValidator = ({ rooms, original }: { rooms: RoomPolicy[]; original: Schedule }) =>
    editBookingFormSchema.superRefine((values, ctx) => {
        const startMs = new Date(values.startTime).getTime();
        const endMs = new Date(values.endTime).getTime();
        const scheduleChanged =
            values.roomId !== original.roomId ||
            values.startTime !== original.startTime ||
            values.endTime !== original.endTime;

        if (scheduleChanged && startMs <= Date.now()) {
            ctx.addIssue({
                code: "custom",
                path: ["startTime"],
                message: "Start time must be in the future",
            });
        }
        if (endMs <= startMs) {
            ctx.addIssue({
                code: "custom",
                path: ["endTime"],
                message: "End time must be after start time",
            });
        }

        const room = rooms.find((item) => item.id === values.roomId);

        if (!scheduleChanged || !room) return;

        const maxDurationMs = room.maxBookingDurationHours * 60 * 60 * 1000;
        if (maxDurationMs && endMs - startMs > maxDurationMs) {
            ctx.addIssue({
                code: "custom",
                path: ["endTime"],
                message: `Bookings cannot exceed ${room.maxBookingDurationHours} hours for ${room.title}`,
            });
        }
    });
