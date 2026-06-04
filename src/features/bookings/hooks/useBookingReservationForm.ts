import type { EventInput } from "@fullcalendar/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { addMinutes, format, startOfMinute } from "date-fns";
import type { SubmitEvent } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";

import { PAST_BOOKING_START_MESSAGE } from "@/features/bookings/booking.constants";
import type {
    BookingFormData,
    BookingReservationInitialDetails,
} from "@/features/bookings/components/booking-reservation-editor.types";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";

type UseBookingReservationFormOptions = {
    error: string | null;
    event: EventInput | null;
    isEditing: boolean;
    isSubmitting: boolean;
    initialDetails: BookingReservationInitialDetails;
    onSubmit: (data: BookingFormData) => void;
};

const getEventRoomId = (event: EventInput | null) =>
    String(event?.resourceId ?? event?.extendedProps?.resourceId ?? "");

const dateTimeLocalFormat = "yyyy-MM-dd'T'HH:mm";
const dateTimeLocalPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const formatDateTimeLocal = (date: Date) => format(date, dateTimeLocalFormat);

const getEventDateTime = (value: EventInput["start"]) => {
    if (!value) return "";
    return formatDateTimeLocal(new Date(String(value)));
};

const createDateTimeLocalSchema = (label: string) =>
    z.string().min(1, `Select a ${label}`).regex(dateTimeLocalPattern, `Select a valid ${label}`);

const createBookingReservationFormSchema = (now: number) =>
    z
        .object({
            title: z.string().trim().min(1, "Meeting title is required").max(160, "Meeting title is too long"),
            roomId: z.string().min(1, "Select a room"),
            startTime: createDateTimeLocalSchema("start time"),
            endTime: createDateTimeLocalSchema("end time"),
            attendeeIds: z.array(z.string()).default([]),
            draftAttendeeIds: z.array(z.string()).default([]),
            description: z.string().trim().max(1000, "Description is too long").default(""),
        })
        .superRefine((data, ctx) => {
            const startTimeMs = new Date(data.startTime).getTime();
            const endTimeMs = new Date(data.endTime).getTime();

            if (Number.isNaN(startTimeMs)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["startTime"],
                    message: "Select a valid start time",
                });
                return;
            }

            if (Number.isNaN(endTimeMs)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["endTime"],
                    message: "Select a valid end time",
                });
                return;
            }

            if (startTimeMs <= now) {
                ctx.addIssue({
                    code: "custom",
                    path: ["startTime"],
                    message: PAST_BOOKING_START_MESSAGE,
                });
            }

            if (endTimeMs <= startTimeMs) {
                ctx.addIssue({
                    code: "custom",
                    path: ["endTime"],
                    message: "End time must be after start time",
                });
            }
        });

export type BookingReservationFormValues = z.infer<ReturnType<typeof createBookingReservationFormSchema>>;
type BookingReservationFieldName = keyof BookingReservationFormValues;

const bookingReservationFieldNames: BookingReservationFieldName[] = [
    "title",
    "roomId",
    "startTime",
    "endTime",
    "attendeeIds",
    "draftAttendeeIds",
    "description",
];

const isBookingReservationFieldName = (value: unknown): value is BookingReservationFieldName =>
    typeof value === "string" && bookingReservationFieldNames.includes(value as BookingReservationFieldName);

const getBookingReservationDefaultValues = ({
    currentUserId,
    event,
    initialDetails,
    isEditing,
}: {
    currentUserId?: string;
    event: EventInput | null;
    initialDetails: BookingReservationInitialDetails;
    isEditing: boolean;
}): BookingReservationFormValues => {
    const attendeeIds =
        isEditing && event && Array.isArray(event.extendedProps?.attendeeIds)
            ? event.extendedProps.attendeeIds.filter(
                  (id): id is string => typeof id === "string" && id !== currentUserId,
              )
            : [];

    return {
        title: isEditing ? (event?.title ?? "") : "",
        roomId: isEditing ? getEventRoomId(event) : (initialDetails.roomId ?? ""),
        startTime: isEditing
            ? getEventDateTime(event?.start)
            : initialDetails.start
              ? formatDateTimeLocal(initialDetails.start)
              : "",
        endTime: isEditing
            ? getEventDateTime(event?.end)
            : initialDetails.end
              ? formatDateTimeLocal(initialDetails.end)
              : "",
        attendeeIds,
        draftAttendeeIds: attendeeIds,
        description:
            isEditing && typeof event?.extendedProps?.description === "string" ? event.extendedProps.description : "",
    };
};

const getReservationFormError = (errors: FieldErrors<BookingReservationFormValues>, externalError: string | null) =>
    errors.title?.message ??
    errors.roomId?.message ??
    errors.startTime?.message ??
    errors.endTime?.message ??
    errors.description?.message ??
    errors.attendeeIds?.message ??
    errors.draftAttendeeIds?.message ??
    errors.root?.message ??
    externalError;

const toBookingFormData = (values: BookingReservationFormValues, currentUserId?: string): BookingFormData => ({
    title: values.title,
    roomId: values.roomId,
    start: new Date(values.startTime),
    end: new Date(values.endTime),
    attendeeIds: values.attendeeIds.filter((id) => id !== currentUserId),
    description: values.description,
});

export const useBookingReservationForm = ({
    error,
    event,
    initialDetails,
    isEditing,
    isSubmitting,
    onSubmit,
}: UseBookingReservationFormOptions) => {
    const { data } = useSuspenseQuery(bookingCalendarQueryOptions());
    const now = Date.now();
    const formSchema = createBookingReservationFormSchema(now);
    const form = useForm({
        resolver: zodResolver(formSchema, undefined, { mode: "sync" }),
        defaultValues: getBookingReservationDefaultValues({
            currentUserId: data.currentUserId,
            event,
            initialDetails,
            isEditing,
        }),
    });

    const { clearErrors, getValues, setError, watch } = form;
    const roomId = watch("roomId");
    const startTime = watch("startTime");
    const endTime = watch("endTime");
    const inviteableUsers = data.currentUserId
        ? data.users.filter((user) => user.id !== data.currentUserId)
        : data.users;
    const selectedRoomId = roomId || initialDetails.roomId;
    const selectedRoom = data.rooms.find((room) => room.id === selectedRoomId);
    const roomIsLockedToInitialDetails = !isEditing && !!initialDetails.roomId && !!selectedRoom;
    const showStartTimeField = isEditing || !initialDetails.start;
    const minimumStartTime = formatDateTimeLocal(addMinutes(startOfMinute(new Date(now)), 1));
    const minimumEndTime = startTime && startTime > minimumStartTime ? startTime : minimumStartTime;
    const selectedStartDate = startTime ? new Date(startTime) : null;
    const selectedEndDate = endTime ? new Date(endTime) : null;
    const timeValidationError =
        selectedStartDate && selectedStartDate.getTime() <= now
            ? PAST_BOOKING_START_MESSAGE
            : selectedStartDate && selectedEndDate && selectedEndDate.getTime() <= selectedStartDate.getTime()
              ? "End time must be after start time"
              : null;
    const submitLabel = isEditing ? (isSubmitting ? "Saving" : "Save") : isSubmitting ? "Reserving" : "Reserve";

    const getFormError = (errors: FieldErrors<BookingReservationFormValues>) =>
        timeValidationError ?? getReservationFormError(errors, error);

    const submitReservation = (e: SubmitEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        const result = createBookingReservationFormSchema(Date.now()).safeParse(getValues());

        if (!result.success) {
            clearErrors();
            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0];

                if (isBookingReservationFieldName(fieldName)) {
                    setError(fieldName, { message: issue.message, type: "manual" });
                    return;
                }

                setError("root", { message: issue.message, type: "manual" });
            });
            return;
        }

        clearErrors();
        onSubmit(toBookingFormData(result.data, data.currentUserId));
    };

    return {
        form,
        getFormError,
        inviteableUsers,
        minimumEndTime,
        minimumStartTime,
        rooms: data.rooms,
        roomIsLockedToInitialDetails,
        selectedRoom,
        showStartTimeField,
        submitDisabled: !!timeValidationError,
        submitLabel,
        submitReservation,
    };
};
