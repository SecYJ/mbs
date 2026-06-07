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
import {
    getBookingConflictMessage,
    getOverlappingBookingConflict,
} from "@/features/bookings/services/booking-conflicts";
import { bookingCalendarQueryOptions } from "@/features/bookings/services/queries";
import { getBookableRooms } from "@/features/bookings/utils/booking-calendar";

type UseBookingReservationFormOptions = {
    error: string | null;
    event: EventInput | null;
    isEditing: boolean;
    isSubmitting: boolean;
    initialDetails: BookingReservationInitialDetails;
    onSubmit: (data: BookingFormData) => void;
};
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

    const bookableRooms = getBookableRooms(data.rooms);
    const bookableRoomIds = new Set(bookableRooms.map((room) => room.id));
    const defaultValues = getBookingReservationDefaultValues({
        bookableRoomIds,
        currentUserId: data.currentUserId,
        event,
        initialDetails,
        isEditing,
    });
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const { clearErrors, getValues, setError, watch } = form;
    const roomId = watch("roomId");
    const startTime = watch("startTime");
    const endTime = watch("endTime");
    const inviteableUsers = data.currentUserId
        ? data.users.filter((user) => user.id !== data.currentUserId)
        : data.users;
    const selectedRoomId = roomId || undefined;
    const selectedRoom = data.rooms.find((room) => room.id === selectedRoomId);
    const selectableRooms =
        isEditing && selectedRoom && !selectedRoom.available ? [selectedRoom, ...bookableRooms] : bookableRooms;
    const roomIsLockedToInitialDetails = false;
    const showStartTimeField = isEditing || !initialDetails.start;
    const scheduleChanged =
        isEditing &&
        (roomId !== defaultValues.roomId || startTime !== defaultValues.startTime || endTime !== defaultValues.endTime);
    const shouldValidateCurrentRoomPolicy = !isEditing || scheduleChanged;
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
    const selectedRoomMaxDurationMs = selectedRoom?.maxBookingDurationHours
        ? selectedRoom.maxBookingDurationHours * 60 * 60 * 1000
        : null;
    const selectedDurationMs =
        selectedStartDate && selectedEndDate ? selectedEndDate.getTime() - selectedStartDate.getTime() : null;
    const durationValidationError =
        shouldValidateCurrentRoomPolicy &&
        selectedRoom &&
        selectedRoomMaxDurationMs &&
        selectedDurationMs &&
        selectedDurationMs > selectedRoomMaxDurationMs
            ? `Bookings cannot exceed ${selectedRoom.maxBookingDurationHours} hours for ${selectedRoom.title}`
            : null;
    const availabilityValidationError =
        shouldValidateCurrentRoomPolicy && selectedRoom?.available === false
            ? "Selected room is not available for booking"
            : null;
    const selectedConflict =
        shouldValidateCurrentRoomPolicy && selectedRoom && selectedStartDate && selectedEndDate
            ? getOverlappingBookingConflict({
                  endTime: selectedEndDate,
                  events: data.events,
                  excludedBookingId: isEditing && event?.id ? String(event.id) : undefined,
                  roomId: selectedRoom.id,
                  roomName: selectedRoom.title,
                  startTime: selectedStartDate,
              })
            : null;
    const scheduleConflictValidationError = selectedConflict ? getBookingConflictMessage(selectedConflict) : null;
    const submitLabel = isEditing ? (isSubmitting ? "Saving" : "Save") : isSubmitting ? "Reserving" : "Reserve";

    const getFormError = (errors: FieldErrors<BookingReservationFormValues>) =>
        timeValidationError ??
        availabilityValidationError ??
        durationValidationError ??
        scheduleConflictValidationError ??
        getReservationFormError(errors, error);

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

        const submittedRoom = data.rooms.find((room) => room.id === result.data.roomId);
        const submittedStartMs = new Date(result.data.startTime).getTime();
        const submittedEndMs = new Date(result.data.endTime).getTime();
        const submittedDurationMs = submittedEndMs - submittedStartMs;

        const submittedScheduleChanged =
            isEditing &&
            (result.data.roomId !== defaultValues.roomId ||
                result.data.startTime !== defaultValues.startTime ||
                result.data.endTime !== defaultValues.endTime);
        const shouldValidateSubmittedRoomPolicy = !isEditing || submittedScheduleChanged;

        if (shouldValidateSubmittedRoomPolicy && submittedRoom?.available === false) {
            clearErrors();
            setError("roomId", {
                message: "Selected room is not available for booking",
                type: "manual",
            });
            return;
        }

        if (
            shouldValidateSubmittedRoomPolicy &&
            submittedRoom &&
            submittedDurationMs > submittedRoom.maxBookingDurationHours * 60 * 60 * 1000
        ) {
            clearErrors();
            setError("endTime", {
                message: `Bookings cannot exceed ${submittedRoom.maxBookingDurationHours} hours for ${submittedRoom.title}`,
                type: "manual",
            });
            return;
        }

        const submittedConflict =
            shouldValidateSubmittedRoomPolicy && submittedRoom
                ? getOverlappingBookingConflict({
                      endTime: result.data.endTime,
                      events: data.events,
                      excludedBookingId: isEditing && event?.id ? String(event.id) : undefined,
                      roomId: submittedRoom.id,
                      roomName: submittedRoom.title,
                      startTime: result.data.startTime,
                  })
                : null;

        if (submittedConflict) {
            clearErrors();
            setError("root", {
                message: getBookingConflictMessage(submittedConflict),
                type: "manual",
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
        rooms: selectableRooms,
        roomIsLockedToInitialDetails,
        selectedRoom,
        showStartTimeField,
        submitDisabled:
            !!timeValidationError ||
            !!availabilityValidationError ||
            !!durationValidationError ||
            !!scheduleConflictValidationError,
        submitLabel,
        submitReservation,
    };
};

const getEventRoomId = (event: EventInput | null) =>
    String(event?.resourceId ?? event?.extendedProps?.resourceId ?? "");

const dateTimeLocalFormat = "yyyy-MM-dd'T'HH:mm";

const formatDateTimeLocal = (date: Date) => format(date, dateTimeLocalFormat);

const getEventDateTime = (value: EventInput["start"]) => {
    if (!value) return "";
    return formatDateTimeLocal(new Date(String(value)));
};

const createDateTimeLocalSchema = (field: string) =>
    z
        .string()
        .min(1, `Select a ${field}`)
        .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, `Select a valid ${field}`);

const createBookingReservationFormSchema = (now: number) =>
    z
        .object({
            title: z.string().trim().min(1, "Meeting title is required").max(160, "Meeting title is too long"),
            roomId: z.string().min(1, "Select a room"),
            startTime: createDateTimeLocalSchema("start time"),
            endTime: createDateTimeLocalSchema("end time"),
            attendeeIds: z.string().array().catch([]),
            draftAttendeeIds: z.string().array().catch([]),
            description: z.string().trim().max(1000, "Description is too long").catch(""),
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
    bookableRoomIds,
    currentUserId,
    event,
    initialDetails,
    isEditing,
}: {
    bookableRoomIds: Set<string>;
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
    const initialRoomId =
        initialDetails.roomId && bookableRoomIds.has(initialDetails.roomId) ? initialDetails.roomId : "";

    return {
        title: isEditing ? (event?.title ?? "") : "",
        roomId: isEditing ? getEventRoomId(event) : initialRoomId,
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
