import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { addMinutes, format, startOfMinute } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/shallow";

import { useBookingCalendarEventsContext } from "@/features/bookings/contexts/BookingCalendarEventsContext";
import {
    getBookingConflictMessage,
    getOverlappingBookingConflict,
} from "@/features/bookings/services/booking-conflicts";
import { createBookingFn, updateBookingFn } from "@/features/bookings/services/fns";
import { bookingMutations } from "@/features/bookings/services/mutations";
import {
    bookingCalendarQueries,
    type BookingCalendarData,
    type BookingCalendarEvents,
} from "@/features/bookings/services/queries";
import { useBookingCalendarStore } from "@/features/bookings/stores/BookingCalendarStore";
import type { ReservationDialogState } from "@/features/bookings/types/reservation-editor.types";
import { notificationQueries } from "@/features/notifications/services/queries";

export type ReservationFormValues = z.infer<typeof bookingReservationFormSchema>;
type BookingSchedule = Pick<ReservationFormValues, "roomId" | "startTime" | "endTime">;
type ReservationFormSchemaContext = {
    calendarEvents: BookingCalendarEvents;
    eventId: string | null;
    initialSchedule: BookingSchedule;
    rooms: BookingCalendarData["rooms"];
};

const dateTimeLocalSchema = (requiredMessage: string, invalidMessage: string) => {
    return z
        .string()
        .min(1, requiredMessage)
        .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, invalidMessage)
        .refine((value) => !Number.isNaN(new Date(value).getTime()), {
            message: invalidMessage,
        });
};

const bookingReservationFormSchema = z.object({
    title: z.string().trim().min(1, "Meeting title is required").max(160, "Meeting title is too long"),
    roomId: z.string().min(1, "Select a room"),
    startTime: dateTimeLocalSchema("Select a start time", "Select a valid start time"),
    endTime: dateTimeLocalSchema("Select an end time", "Select a valid end time"),
    attendeeIds: z.string().array(),
    draftAttendeeIds: z.string().array(),
    description: z.string().trim().max(1000, "Description is too long"),
});

const eventDetailsSchema = z.object({
    attendeeIds: z.string().array().catch([]),
    description: z.string().catch(""),
});

const toDateTimeLocal = (value?: Date | string) => {
    if (!value) return "";

    return format(value instanceof Date ? value : new Date(value), "yyyy-MM-dd'T'HH:mm");
};

const createBookingReservationFormSchema = ({
    calendarEvents,
    eventId,
    initialSchedule,
    rooms,
}: ReservationFormSchemaContext) =>
    bookingReservationFormSchema.superRefine((values, ctx) => {
        const startMs = new Date(values.startTime).getTime();
        const endMs = new Date(values.endTime).getTime();

        const scheduleChanged =
            values.roomId !== initialSchedule.roomId ||
            values.startTime !== initialSchedule.startTime ||
            values.endTime !== initialSchedule.endTime;

        // An untouched schedule on an existing booking is left alone so an
        // in-progress booking can still have its title or notes edited.
        const shouldValidateSchedule = !eventId || scheduleChanged;

        if (shouldValidateSchedule && startMs <= Date.now()) {
            ctx.addIssue({
                code: "custom",
                path: ["startTime"],
                message: "Start time must be in the future",
            });
            return;
        }

        if (endMs <= startMs) {
            ctx.addIssue({
                code: "custom",
                path: ["endTime"],
                message: "End time must be after start time",
            });
            return;
        }

        if (!shouldValidateSchedule) return;

        const room = rooms.find((item) => item.id === values.roomId);
        if (!room) return;

        const maxDurationMs = room.maxBookingDurationHours * 60 * 60 * 1000;
        if (endMs - startMs > maxDurationMs) {
            ctx.addIssue({
                code: "custom",
                path: ["endTime"],
                message: `Bookings cannot exceed ${room.maxBookingDurationHours} hours for ${room.title}`,
            });
            return;
        }

        const conflict = getOverlappingBookingConflict({
            endTime: values.endTime,
            events: calendarEvents,
            excludedBookingId: eventId ?? undefined,
            roomId: room.id,
            roomName: room.title,
            startTime: values.startTime,
        });

        if (conflict) {
            ctx.addIssue({
                code: "custom",
                path: ["root"],
                message: getBookingConflictMessage(conflict),
            });
        }
    });

const resolveDialogEvent = (dialogState: ReservationDialogState | null, calendarEvents: BookingCalendarEvents) => {
    const snapshotEvent = dialogState?.mode === "view" ? dialogState.event : null;
    const initialDetails = dialogState?.mode === "create" ? dialogState.initialDetails : undefined;

    const eventId = snapshotEvent?.id ?? null;
    const event = (eventId ? calendarEvents.find((booking) => booking.id === eventId) : null) ?? snapshotEvent;

    const { attendeeIds, description } = eventDetailsSchema.parse(event?.extendedProps ?? {});

    return {
        eventId,
        title: event?.title ?? "",
        initialSchedule: {
            roomId: event?.resourceId ?? initialDetails?.roomId ?? "",
            startTime: toDateTimeLocal(event?.start ?? initialDetails?.start),
            endTime: toDateTimeLocal(event?.end ?? initialDetails?.end),
        },
        attendeeIds,
        description,
    };
};

export const useReservationForm = () => {
    const { data: rooms } = useSuspenseQuery({
        ...bookingCalendarQueries.data(),
        select: (data) => data.rooms,
    });

    const calendarEvents = useBookingCalendarEventsContext();

    const [dialogState, { closeReservation }] = useBookingCalendarStore(
        useShallow((s) => [s.activeReservationDialog, s.actions]),
    );

    const createBooking = useServerFn(createBookingFn);
    const updateBooking = useServerFn(updateBookingFn);

    const { eventId, title, initialSchedule, attendeeIds, description } = resolveDialogEvent(
        dialogState,
        calendarEvents,
    );
    const isExistingBooking = eventId !== null;

    const form = useForm({
        resolver: zodResolver(
            createBookingReservationFormSchema({
                calendarEvents,
                eventId,
                initialSchedule,
                rooms,
            }),
        ),
        mode: "onChange",
        defaultValues: {
            title,
            ...initialSchedule,
            attendeeIds,
            draftAttendeeIds: attendeeIds,
            description,
        },
    });

    const bookingMutation = useMutation({
        mutationKey: (isExistingBooking ? bookingMutations.update() : bookingMutations.create()).mutationKey,
        mutationFn: (values: ReservationFormValues) => {
            const payload = {
                title: values.title,
                roomId: values.roomId,
                startTime: new Date(values.startTime).toISOString(),
                endTime: new Date(values.endTime).toISOString(),
                attendeeIds: values.attendeeIds,
                description: values.description,
            };

            return eventId
                ? updateBooking({ data: { bookingId: eventId, ...payload } })
                : createBooking({ data: payload });
        },
        onSuccess: async (_1, _2, _3, context) => {
            await Promise.all([
                context.client.invalidateQueries(bookingCalendarQueries.data()),
                context.client.invalidateQueries(notificationQueries.list()),
            ]);

            closeReservation();
        },
    });

    const minimumStartTime = toDateTimeLocal(addMinutes(startOfMinute(new Date()), 1));

    const submitReservation = form.handleSubmit((values) => {
        if (bookingMutation.isPending) return;

        bookingMutation.mutate(values);
    });

    return {
        error: bookingMutation.error?.message ?? null,
        form,
        isExistingBooking,
        minimumStartTime,
        submitReservation,
    };
};
