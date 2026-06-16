import type { EventInput } from "@fullcalendar/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { addMinutes, format, startOfMinute } from "date-fns";
import { useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";

import { PAST_BOOKING_START_MESSAGE } from "@/features/bookings/booking.constants";
import type {
    BookingReservationEditing,
    BookingReservationInitialDetails,
    BookingReservationPayload,
    BookingReservationRoom,
} from "@/features/bookings/components/booking-reservation-editor.types";
import { useBookingCalendarEvents } from "@/features/bookings/hooks/useBookingCalendarEvents";
import {
    getBookingConflictMessage,
    getOverlappingBookingConflict,
} from "@/features/bookings/services/booking-conflicts";
import { createBookingFn } from "@/features/bookings/services/fns";
import { bookingCalendarQueryOptions, type BookingCalendarData } from "@/features/bookings/services/queries";
import { useBookingCalendarStore } from "@/features/bookings/stores/BookingCalendarStore";
import { notificationsQueryOptions } from "@/features/notifications/services/queries";

const dateTimeLocalPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const selectReservationData = ({ currentUserId, rooms, users }: BookingCalendarData) => ({
    currentUserId,
    rooms,
    users,
    bookableRooms: rooms.filter((room) => room.available),
});

const bookingReservationFormSchema = z.object({
    title: z.string().trim().min(1, "Meeting title is required").max(160, "Meeting title is too long"),
    roomId: z.string().min(1, "Select a room"),
    startTime: z.string().min(1, "Select a start time").regex(dateTimeLocalPattern, "Select a valid start time"),
    endTime: z.string().min(1, "Select a end time").regex(dateTimeLocalPattern, "Select a valid end time"),
    attendeeIds: z.string().array().catch([]),
    draftAttendeeIds: z.string().array().catch([]),
    description: z.string().trim().max(1000, "Description is too long").catch(""),
});

export type BookingReservationFormValues = z.infer<typeof bookingReservationFormSchema>;
type BookingReservationFieldName = keyof BookingReservationFormValues;
type BookingSchedule = Pick<BookingReservationFormValues, "roomId" | "startTime" | "endTime">;

const toDateTimeLocal = (value: Date | EventInput["start"]) =>
    value ? format(value instanceof Date ? value : new Date(String(value)), "yyyy-MM-dd'T'HH:mm") : "";

type UseBookingReservationFormOptions = {
    editing?: BookingReservationEditing;
    initialDetails: BookingReservationInitialDetails;
};

const getBookingReservationFormValues = ({
    bookableRooms,
    currentUserId,
    editing,
    initialDetails,
}: UseBookingReservationFormOptions & {
    bookableRooms: BookingReservationRoom[];
    currentUserId: string;
}) => {
    if (editing) {
        const { event } = editing;
        const attendeeIds = z
            .string()
            .array()
            .transform((arr) => arr.filter((id) => id !== currentUserId))
            .catch([])
            .parse(event.extendedProps?.attendeeIds);

        return {
            title: event.title ?? "",
            roomId: String(event.resourceId ?? event.extendedProps?.resourceId ?? ""),
            startTime: toDateTimeLocal(event.start),
            endTime: toDateTimeLocal(event.end),
            attendeeIds,
            draftAttendeeIds: attendeeIds,
            description: z.string().catch("").parse(event.extendedProps?.description),
        };
    }

    const initialRoomIsBookable = bookableRooms.some((room) => room.id === initialDetails.roomId);

    return {
        title: "",
        roomId: initialDetails.roomId && initialRoomIsBookable ? initialDetails.roomId : "",
        startTime: initialDetails.start ? toDateTimeLocal(initialDetails.start) : "",
        endTime: initialDetails.end ? toDateTimeLocal(initialDetails.end) : "",
        attendeeIds: [],
        draftAttendeeIds: [],
        description: "",
    };
};

export const useBookingReservationForm = ({ editing, initialDetails }: UseBookingReservationFormOptions) => {
    const { data } = useSuspenseQuery({
        ...bookingCalendarQueryOptions(),
        select: selectReservationData,
    });
    const calendarEvents = useBookingCalendarEvents();
    const { closeReservationDialog } = useBookingCalendarStore((state) => state.actions);
    const queryClient = useQueryClient();
    const createBooking = useServerFn(createBookingFn);

    // Create mode is self-contained: the form owns the create mutation and
    // closes the dialog itself. Edit mode injects everything via `editing`,
    // since the update mutation belongs to the view flow.
    const createBookingMutation = useMutation({
        mutationFn: createBooking,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries(bookingCalendarQueryOptions()),
                queryClient.invalidateQueries(notificationsQueryOptions()),
            ]);

            closeReservationDialog();
        },
    });

    const isEditing = editing !== undefined;
    const error = editing
        ? editing.error
        : createBookingMutation.error instanceof Error
          ? createBookingMutation.error.message
          : null;
    const isSubmitting = editing?.isSubmitting ?? createBookingMutation.isPending;
    const onSubmit =
        editing?.onSubmit ?? ((payload: BookingReservationPayload) => createBookingMutation.mutate({ data: payload }));

    const formValues = getBookingReservationFormValues({
        bookableRooms: data.bookableRooms,
        currentUserId: data.currentUserId,
        editing,
        initialDetails,
    });
    const form = useForm({ resolver: zodResolver(bookingReservationFormSchema), values: formValues });
    const { watch } = form;

    // The booking's original room stays selectable while editing, even if it
    // has since become unavailable.
    const originalRoom = isEditing ? data.rooms.find((room) => room.id === formValues.roomId) : undefined;
    const rooms = originalRoom && !originalRoom.available ? [originalRoom, ...data.bookableRooms] : data.bookableRooms;
    const inviteableUsers = data.currentUserId
        ? data.users.filter((user) => user.id !== data.currentUserId)
        : data.users;
    const showStartTimeField = isEditing || !initialDetails.start;
    const minimumStartTime = toDateTimeLocal(addMinutes(startOfMinute(new Date()), 1));

    // Every booking rule lives here, applied to the live schedule below (submit
    // button + banner) and to the parsed values at submit time, so the two
    // paths can never drift apart. While editing, room policy only applies once
    // the schedule actually changes, so an existing booking stays saveable even
    // if its room has since become unavailable.
    const getPolicyError = (
        values: BookingSchedule,
    ): { field: BookingReservationFieldName | "root"; message: string } | null => {
        const now = Date.now();
        const startMs = values.startTime ? new Date(values.startTime).getTime() : null;
        const endMs = values.endTime ? new Date(values.endTime).getTime() : null;

        if (Number.isNaN(startMs)) {
            return { field: "startTime", message: "Select a valid start time" };
        }
        if (Number.isNaN(endMs)) return { field: "endTime", message: "Select a valid end time" };

        if (startMs === null) return null;

        if (startMs <= now) {
            return { field: "startTime", message: PAST_BOOKING_START_MESSAGE };
        }

        if (endMs === null) return null;

        if (endMs <= startMs) {
            return { field: "endTime", message: "End time must be after start time" };
        }

        const scheduleChanged =
            values.roomId !== formValues.roomId ||
            values.startTime !== formValues.startTime ||
            values.endTime !== formValues.endTime;
        const room = data.rooms.find((item) => item.id === values.roomId);

        if ((isEditing && !scheduleChanged) || !room) return null;

        if (!room.available) return { field: "roomId", message: "Selected room is not available for booking" };

        const maxDurationMs = room.maxBookingDurationHours * 60 * 60 * 1000;
        if (maxDurationMs && endMs - startMs > maxDurationMs) {
            return {
                field: "endTime",
                message: `Bookings cannot exceed ${room.maxBookingDurationHours} hours for ${room.title}`,
            };
        }

        const conflict = getOverlappingBookingConflict({
            endTime: values.endTime,
            events: calendarEvents,
            excludedBookingId: editing?.event.id ? String(editing.event.id) : undefined,
            roomId: room.id,
            roomName: room.title,
            startTime: values.startTime,
        });

        return conflict ? { field: "root", message: getBookingConflictMessage(conflict) } : null;
    };

    // The only reactive form state the hook reads; everything else subscribes
    // through Controller/FormStateSubscribe in the component.
    const [roomId, startTime, endTime] = watch(["roomId", "startTime", "endTime"]);
    const minimumEndTime = startTime && startTime > minimumStartTime ? startTime : minimumStartTime;
    const policyError = getPolicyError({ roomId, startTime, endTime });

    const getFormError = (errors: FieldErrors<BookingReservationFormValues>) =>
        policyError?.message ??
        errors.title?.message ??
        errors.roomId?.message ??
        errors.startTime?.message ??
        errors.endTime?.message ??
        errors.description?.message ??
        errors.attendeeIds?.message ??
        errors.draftAttendeeIds?.message ??
        errors.root?.message ??
        error;

    const submitReservation = form.handleSubmit((values) => {
        if (isSubmitting) return;

        const submitError = getPolicyError(values);

        if (submitError) {
            form.setError(submitError.field, { message: submitError.message, type: "manual" });
            return;
        }

        onSubmit({
            title: values.title,
            roomId: values.roomId,
            startTime: new Date(values.startTime).toISOString(),
            endTime: new Date(values.endTime).toISOString(),
            attendeeIds: values.attendeeIds.filter((id) => id !== data.currentUserId),
            description: values.description,
        });
    });

    return {
        form,
        getFormError,
        inviteableUsers,
        isSubmitting,
        minimumEndTime,
        minimumStartTime,
        onCancel: editing?.onCancel ?? closeReservationDialog,
        rooms,
        showStartTimeField,
        submitDisabled: policyError !== null,
        submitLabel: isEditing ? (isSubmitting ? "Saving" : "Save") : isSubmitting ? "Reserving" : "Reserve",
        submitReservation,
    };
};
