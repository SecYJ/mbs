import { useEffect, useState } from "react";
import type { EventInput } from "@fullcalendar/core";
import { LegendList } from "@legendapp/list/react";
import { ArrowRight, Ban, Clock, MapPin, Pencil, Save, Search, Users, X } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PAST_BOOKING_START_MESSAGE } from "@/features/bookings/booking.constants";

export interface BookingFormData {
    title: string;
    roomId: string;
    start: Date;
    end: Date;
    attendeeIds: string[];
    description: string;
}

interface Room {
    id: string;
    title: string;
    location: string;
    capacity: number;
    equipment: string[];
}

interface BookableUser {
    id: string;
    name: string;
    email: string;
}

interface BookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "view";
    rooms: Room[];
    users: BookableUser[];
    currentUserId?: string;
    event: EventInput | null;
    prefill: { roomId?: string; start?: Date; end?: Date };
    onSubmit: (data: BookingFormData) => void;
    isSubmitting?: boolean;
    error?: string | null;
    canManage?: boolean;
    onUpdateBooking?: (bookingId: string, data: BookingFormData) => void;
    isUpdating?: boolean;
    updateError?: string | null;
    onCancelBooking?: (bookingId: string, cancelReason: string) => void;
    isCancelling?: boolean;
    cancelError?: string | null;
}

const DIALOG_CLASS =
    "border border-[var(--hairline)] bg-[var(--surface-01)] text-[var(--bone)] rounded-none shadow-[0_40px_80px_rgba(0,0,0,0.6)]";

const padDatePart = (n: number) => n.toString().padStart(2, "0");

const formatDateTimeLocal = (date: Date) => {
    return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
};

const getNextMinuteDate = (date: Date) => {
    const nextMinute = new Date(date);
    nextMinute.setSeconds(0, 0);
    nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    return nextMinute;
};

const formatTimeDisplay = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const formatDateDisplay = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

export const BookingDialog = ({
    open,
    onOpenChange,
    mode,
    rooms,
    users,
    currentUserId,
    event,
    prefill,
    onSubmit,
    isSubmitting = false,
    error = null,
    canManage = false,
    onUpdateBooking,
    isUpdating = false,
    updateError = null,
    onCancelBooking,
    isCancelling = false,
    cancelError = null,
}: BookingDialogProps) => {
    const [title, setTitle] = useState("");
    const [roomId, setRoomId] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [description, setDescription] = useState("");
    const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
    const [attendeePickerOpen, setAttendeePickerOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const organizerId =
        typeof event?.extendedProps?.organizerId === "string" ? event.extendedProps.organizerId : currentUserId;
    const excludedAttendeeIds = new Set(
        [currentUserId, organizerId].filter((id): id is string => typeof id === "string"),
    );
    const sanitizeAttendeeIds = (ids: string[]) =>
        Array.from(new Set(ids.filter((id) => !excludedAttendeeIds.has(id))));

    useEffect(() => {
        if (!open) return;

        setValidationError(null);

        if (mode === "create") {
            setTitle("");
            setRoomId(prefill.roomId ?? "");
            setStartTime(prefill.start ? formatDateTimeLocal(prefill.start) : "");
            setEndTime(prefill.end ? formatDateTimeLocal(prefill.end) : "");
            setDescription("");
            setAttendeeIds([]);
            setAttendeePickerOpen(false);
            setIsEditing(false);
            setCancelConfirmOpen(false);
            setCancelReason("");
            return;
        }

        if (mode === "view" && event) {
            const nextExcludedAttendeeIds = new Set(
                [currentUserId, event.extendedProps?.organizerId].filter((id): id is string => typeof id === "string"),
            );
            const nextAttendeeIds = Array.isArray(event.extendedProps?.attendeeIds)
                ? event.extendedProps.attendeeIds.filter(
                      (id): id is string => typeof id === "string" && !nextExcludedAttendeeIds.has(id),
                  )
                : [];

            setTitle(event.title ?? "");
            setRoomId(String(event.resourceId ?? ""));
            setStartTime(event.start ? formatDateTimeLocal(new Date(String(event.start))) : "");
            setEndTime(event.end ? formatDateTimeLocal(new Date(String(event.end))) : "");
            setDescription(typeof event.extendedProps?.description === "string" ? event.extendedProps.description : "");
            setAttendeeIds(nextAttendeeIds);
            setAttendeePickerOpen(false);
            setIsEditing(false);
            setCancelConfirmOpen(false);
            setCancelReason("");
        }
    }, [open, mode, prefill, event, currentUserId]);

    const inviteableUsers = users.filter((user) => !excludedAttendeeIds.has(user.id));
    const sanitizedAttendeeIds = sanitizeAttendeeIds(attendeeIds);
    const selectedAttendees = inviteableUsers.filter((user) => sanitizedAttendeeIds.includes(user.id));

    const clearValidationError = () => {
        setValidationError(null);
    };

    const removeAttendee = (userId: string) => {
        setAttendeeIds((prev) => prev.filter((id) => id !== userId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !roomId || !startTime || !endTime || isSubmitting || isUpdating) return;

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start.getTime() <= Date.now()) {
            setValidationError(PAST_BOOKING_START_MESSAGE);
            return;
        }

        if (end.getTime() <= start.getTime()) {
            setValidationError("End time must be after start time");
            return;
        }

        const formData = {
            title,
            roomId,
            start,
            end,
            attendeeIds: sanitizeAttendeeIds(attendeeIds),
            description,
        };

        if (mode === "view" && isEditing && event?.id && onUpdateBooking) {
            onUpdateBooking(String(event.id), formData);
            return;
        }

        onSubmit(formData);
    };

    const selectedRoomId = mode === "view" && !isEditing ? String(event?.resourceId) : roomId || prefill.roomId;
    const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
    const roomIsPrefilled = mode === "create" && !!prefill.roomId && !!selectedRoom;
    const requestCancelBooking = () => {
        if (!event?.id || !onCancelBooking || isCancelling) return;

        setCancelConfirmOpen(true);
        setCancelReason("");
    };
    const confirmCancelBooking = () => {
        if (!event?.id || !onCancelBooking || isCancelling) return;

        onCancelBooking(String(event.id), cancelReason);
    };
    const formIsEditing = mode === "view" && isEditing;
    const formIsSubmitting = formIsEditing ? isUpdating : isSubmitting;
    const minimumStartTime = formatDateTimeLocal(getNextMinuteDate(new Date()));
    const minimumEndTime = startTime && startTime > minimumStartTime ? startTime : minimumStartTime;
    const selectedStartDate = startTime ? new Date(startTime) : null;
    const selectedEndDate = endTime ? new Date(endTime) : null;
    const timeValidationError =
        selectedStartDate && selectedStartDate.getTime() <= Date.now()
            ? PAST_BOOKING_START_MESSAGE
            : selectedStartDate && selectedEndDate && selectedEndDate.getTime() <= selectedStartDate.getTime()
              ? "End time must be after start time"
              : null;
    const formError = validationError ?? timeValidationError ?? (formIsEditing ? updateError : error);
    const submitLabel = formIsEditing ? (isUpdating ? "Saving" : "Save") : isSubmitting ? "Reserving" : "Reserve";
    const roomSelectItems = rooms.map((room) => ({
        value: room.id,
        label: (
            <>
                <span className="font-medium">{room.title}</span>
                <span className="tabular-num ml-2 text-[var(--bone-dim)]">
                    &middot; {room.location} &middot; {room.capacity}p
                </span>
            </>
        ),
    }));

    if (mode === "view" && event && !isEditing) {
        return (
            <BookingDetailsDialog
                open={open}
                onOpenChange={onOpenChange}
                event={event}
                selectedRoom={selectedRoom}
                canManage={canManage}
                cancelError={cancelError}
                cancelConfirmOpen={cancelConfirmOpen}
                cancelReason={cancelReason}
                isCancelling={isCancelling}
                onEdit={() => setIsEditing(true)}
                onRequestCancel={requestCancelBooking}
                onCancelReasonChange={setCancelReason}
                onCancelConfirmClose={() => setCancelConfirmOpen(false)}
                onConfirmCancel={confirmCancelBooking}
            />
        );
    }

    return (
        <BookingFormDialog
            open={open}
            onOpenChange={onOpenChange}
            formIsEditing={formIsEditing}
            title={title}
            onTitleChange={setTitle}
            rooms={rooms}
            roomId={roomId}
            onRoomIdChange={setRoomId}
            roomSelectItems={roomSelectItems}
            roomIsPrefilled={roomIsPrefilled}
            selectedRoom={selectedRoom}
            startTime={startTime}
            onStartTimeChange={setStartTime}
            endTime={endTime}
            onEndTimeChange={setEndTime}
            minimumStartTime={minimumStartTime}
            minimumEndTime={minimumEndTime}
            selectedAttendees={selectedAttendees}
            onRemoveAttendee={removeAttendee}
            attendeePickerOpen={attendeePickerOpen}
            onAttendeePickerOpenChange={setAttendeePickerOpen}
            inviteableUsers={inviteableUsers}
            selectedAttendeeIds={sanitizedAttendeeIds}
            onAttendeeIdsChange={(ids) => setAttendeeIds(sanitizeAttendeeIds(ids))}
            description={description}
            onDescriptionChange={setDescription}
            formError={formError}
            formIsSubmitting={formIsSubmitting}
            timeValidationError={timeValidationError}
            submitLabel={submitLabel}
            onSubmit={handleSubmit}
            onCloseForm={() => (formIsEditing ? setIsEditing(false) : onOpenChange(false))}
            onClearValidationError={clearValidationError}
        />
    );
};

const BookingFormDialog = ({
    open,
    onOpenChange,
    formIsEditing,
    title,
    onTitleChange,
    rooms,
    roomId,
    onRoomIdChange,
    roomSelectItems,
    roomIsPrefilled,
    selectedRoom,
    startTime,
    onStartTimeChange,
    endTime,
    onEndTimeChange,
    minimumStartTime,
    minimumEndTime,
    selectedAttendees,
    onRemoveAttendee,
    attendeePickerOpen,
    onAttendeePickerOpenChange,
    inviteableUsers,
    selectedAttendeeIds,
    onAttendeeIdsChange,
    description,
    onDescriptionChange,
    formError,
    formIsSubmitting,
    timeValidationError,
    submitLabel,
    onSubmit,
    onCloseForm,
    onClearValidationError,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formIsEditing: boolean;
    title: string;
    onTitleChange: (title: string) => void;
    rooms: Room[];
    roomId: string;
    onRoomIdChange: (roomId: string) => void;
    roomSelectItems: { value: string; label: React.ReactNode }[];
    roomIsPrefilled: boolean;
    selectedRoom?: Room;
    startTime: string;
    onStartTimeChange: (startTime: string) => void;
    endTime: string;
    onEndTimeChange: (endTime: string) => void;
    minimumStartTime: string;
    minimumEndTime: string;
    selectedAttendees: BookableUser[];
    onRemoveAttendee: (userId: string) => void;
    attendeePickerOpen: boolean;
    onAttendeePickerOpenChange: (open: boolean) => void;
    inviteableUsers: BookableUser[];
    selectedAttendeeIds: string[];
    onAttendeeIdsChange: (ids: string[]) => void;
    description: string;
    onDescriptionChange: (description: string) => void;
    formError: string | null;
    formIsSubmitting: boolean;
    timeValidationError: string | null;
    submitLabel: string;
    onSubmit: (e: React.FormEvent) => void;
    onCloseForm: () => void;
    onClearValidationError: () => void;
}) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={`${DIALOG_CLASS} sm:max-w-lg`}>
            <DialogHeader>
                <p className="eyebrow eyebrow-gold">{formIsEditing ? "Edit Reservation" : "New Reservation"}</p>
                <DialogTitle className="mt-2 display-italic text-[1.75rem] leading-[1.05] font-normal text-[var(--bone)]">
                    {formIsEditing ? "Update the booking." : "Reserve a room."}
                </DialogTitle>
                <DialogDescription className="text-[0.78rem] text-[var(--bone-muted)]">
                    {formIsEditing
                        ? "Adjust the room, time, attendees, or notes for this reservation."
                        : "Enter the details below to add a booking to the ledger."}
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="mt-4 space-y-6 border-t border-[var(--hairline)] pt-6">
                <div className="space-y-2">
                    <Label className="eyebrow block">Meeting Title</Label>
                    <Input
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="e.g. Sprint Planning"
                        required
                        className="login-input-underline h-10 rounded-none bg-transparent text-[0.9rem] text-[var(--bone)] shadow-none placeholder:text-[var(--bone-faint)] focus-visible:ring-0"
                    />
                </div>

                <BookingRoomFields
                    rooms={rooms}
                    roomId={roomId}
                    onRoomIdChange={onRoomIdChange}
                    roomSelectItems={roomSelectItems}
                    roomIsPrefilled={roomIsPrefilled}
                    selectedRoom={selectedRoom}
                />

                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="eyebrow block">Start Time</Label>
                        <Input
                            type="datetime-local"
                            value={startTime}
                            min={minimumStartTime}
                            onChange={(e) => {
                                onStartTimeChange(e.target.value);
                                onClearValidationError();
                            }}
                            required
                            className="login-input-underline tabular-num h-10 rounded-none bg-transparent text-[0.85rem] text-[var(--bone)] shadow-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="eyebrow block">End Time</Label>
                        <Input
                            type="datetime-local"
                            value={endTime}
                            min={minimumEndTime}
                            onChange={(e) => {
                                onEndTimeChange(e.target.value);
                                onClearValidationError();
                            }}
                            required
                            className="login-input-underline tabular-num h-10 rounded-none bg-transparent text-[0.85rem] text-[var(--bone)] shadow-none focus-visible:ring-0 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="eyebrow block">Attendees</Label>
                    <button
                        type="button"
                        onClick={() => onAttendeePickerOpenChange(true)}
                        className="flex h-10 w-full cursor-pointer items-center justify-between border border-[var(--hairline)] bg-[var(--surface-02)] px-3 text-left transition-all hover:border-[var(--hairline-strong)]"
                    >
                        <span className="flex items-center gap-3">
                            <Users className="size-4 text-[var(--bone-dim)]" strokeWidth={1.5} />
                            <span className="text-[0.86rem] text-[var(--bone)]">Invite attendees</span>
                        </span>
                        <span className="tabular-num text-[0.64rem] font-semibold tracking-[0.24em] text-[var(--bone-dim)] uppercase">
                            {selectedAttendees.length === 0 ? "None" : `${selectedAttendees.length} selected`}
                        </span>
                    </button>
                    {selectedAttendees.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                            {selectedAttendees.map((attendee) => (
                                <span
                                    key={attendee.id}
                                    className="inline-flex items-center gap-1 border border-[var(--hairline)] bg-[var(--surface-02)] px-2 py-0.5 text-[0.7rem] text-[var(--bone-muted)]"
                                >
                                    {attendee.name}
                                    <button
                                        type="button"
                                        onClick={() => onRemoveAttendee(attendee.id)}
                                        aria-label={`Remove ${attendee.name}`}
                                        className="ml-0.5 cursor-pointer text-[var(--bone-dim)] transition-colors hover:text-[var(--gold)]"
                                    >
                                        <X className="size-3" strokeWidth={1.6} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <AttendeePickerDialog
                        open={attendeePickerOpen}
                        onOpenChange={onAttendeePickerOpenChange}
                        users={inviteableUsers}
                        selectedIds={selectedAttendeeIds}
                        onCommit={onAttendeeIdsChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="eyebrow block">
                        Description <span className="ml-1 text-[var(--bone-faint)]">(optional)</span>
                    </Label>
                    <Textarea
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="Meeting agenda or notes..."
                        rows={3}
                        className="resize-none rounded-none border border-[var(--hairline)] bg-[var(--surface-02)] px-3 py-2.5 text-[0.88rem] leading-relaxed text-[var(--bone)] shadow-none placeholder:text-[var(--bone-faint)] focus:border-[var(--gold)] focus-visible:ring-0"
                    />
                </div>

                {formError && (
                    <p className="border border-red-400/30 bg-red-500/10 px-3 py-2 text-[0.75rem] text-red-200">
                        {formError}
                    </p>
                )}

                <div className="flex gap-3 border-t border-[var(--hairline)] pt-5">
                    <button
                        type="button"
                        onClick={onCloseForm}
                        disabled={formIsSubmitting}
                        className="flex-1 cursor-pointer border border-[var(--hairline)] py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-[var(--bone-muted)] transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={formIsSubmitting || !!timeValidationError}
                        className="group flex flex-1 cursor-pointer items-center justify-center gap-2 border border-[var(--bone)] bg-[var(--bone)] py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-black transition-all hover:bg-white hover:tracking-[0.32em] disabled:cursor-wait disabled:opacity-70"
                    >
                        <span>{submitLabel}</span>
                        {formIsEditing ? (
                            <Save className="size-4" strokeWidth={1.6} />
                        ) : (
                            <ArrowRight
                                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                strokeWidth={1.6}
                            />
                        )}
                    </button>
                </div>
            </form>
        </DialogContent>
    </Dialog>
);

const BookingRoomFields = ({
    rooms,
    roomId,
    onRoomIdChange,
    roomSelectItems,
    roomIsPrefilled,
    selectedRoom,
}: {
    rooms: Room[];
    roomId: string;
    onRoomIdChange: (roomId: string) => void;
    roomSelectItems: { value: string; label: React.ReactNode }[];
    roomIsPrefilled: boolean;
    selectedRoom?: Room;
}) => (
    <div className="space-y-3">
        {roomIsPrefilled && selectedRoom ? (
            <div className="space-y-2">
                <p className="eyebrow block">Room</p>
                <div className="border border-[var(--hairline)] bg-[var(--surface-02)] px-3 py-2.5">
                    <span className="text-[0.9rem] font-medium text-[var(--bone)]">{selectedRoom.title}</span>
                    <span className="tabular-num ml-2 text-[0.72rem] text-[var(--bone-dim)]">
                        &middot; {selectedRoom.location} &middot; {selectedRoom.capacity}p
                    </span>
                </div>
            </div>
        ) : (
            <div className="space-y-2">
                <Label className="eyebrow block">Room</Label>
                <Select
                    value={roomId}
                    onValueChange={(value) => onRoomIdChange(value ?? "")}
                    items={roomSelectItems}
                    required
                >
                    <SelectTrigger className="h-10 border-0 border-b border-[var(--hairline)] bg-transparent text-[0.9rem] text-[var(--bone)] shadow-none ring-0 rounded-none focus:border-[var(--gold)] focus:ring-0 [&>svg]:text-[var(--bone-dim)]">
                        <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-[var(--hairline)] bg-[var(--surface-02)]">
                        {rooms.map((room) => (
                            <SelectItem
                                key={room.id}
                                value={room.id}
                                className="rounded-none text-[var(--bone)] focus:bg-[var(--gold-wash)] focus:text-[var(--bone)]"
                            >
                                <span className="font-medium">{room.title}</span>
                                <span className="tabular-num ml-2 text-[var(--bone-dim)]">
                                    &middot; {room.location} &middot; {room.capacity}p
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )}
        {selectedRoom && selectedRoom.equipment.length > 0 && (
            <div className="space-y-2">
                <p className="eyebrow block">Equipment</p>
                <div className="flex flex-wrap gap-1.5">
                    {selectedRoom.equipment.map((item) => (
                        <span
                            key={item}
                            className="border border-[var(--hairline)] px-2 py-0.5 text-[0.66rem] tracking-[0.08em] uppercase text-[var(--bone-dim)]"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const BookingDetailsDialog = ({
    open,
    onOpenChange,
    event,
    selectedRoom,
    canManage,
    cancelError,
    cancelConfirmOpen,
    cancelReason,
    isCancelling,
    onEdit,
    onRequestCancel,
    onCancelReasonChange,
    onCancelConfirmClose,
    onConfirmCancel,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: EventInput;
    selectedRoom?: Room;
    canManage: boolean;
    cancelError: string | null;
    cancelConfirmOpen: boolean;
    cancelReason: string;
    isCancelling: boolean;
    onEdit: () => void;
    onRequestCancel: () => void;
    onCancelReasonChange: (reason: string) => void;
    onCancelConfirmClose: () => void;
    onConfirmCancel: () => void;
}) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={`${DIALOG_CLASS} sm:max-w-md`}>
            <DialogHeader>
                <p className="eyebrow eyebrow-gold">Reservation</p>
                <DialogTitle className="mt-2 display-italic text-[1.75rem] leading-[1.05] font-normal text-[var(--bone)]">
                    {event.title}
                </DialogTitle>
                <DialogDescription className="text-[0.78rem] text-[var(--bone-muted)]">
                    Organized by{" "}
                    <span className="text-[var(--bone)]">{event.extendedProps?.organizer ?? "Unknown"}</span>
                </DialogDescription>
            </DialogHeader>

            <div className="mt-4 border-t border-[var(--hairline)] pt-6">
                <dl className="space-y-5">
                    {selectedRoom && (
                        <InfoRow icon={<MapPin className="size-[15px]" strokeWidth={1.4} />} label="Room">
                            <span className="text-[0.88rem] font-medium text-[var(--bone)]">{selectedRoom.title}</span>
                            <span className="tabular-num ml-2 text-[0.72rem] text-[var(--bone-dim)]">
                                {selectedRoom.location} &middot; {selectedRoom.capacity}p
                            </span>
                        </InfoRow>
                    )}

                    <InfoRow icon={<Clock className="size-[15px]" strokeWidth={1.4} />} label="Time">
                        <span className="tabular-num text-[0.95rem] font-medium text-[var(--gold)]">
                            {formatTimeDisplay(event.start as string)} &mdash; {formatTimeDisplay(event.end as string)}
                        </span>
                        <span className="ml-3 text-[0.72rem] text-[var(--bone-dim)]">
                            {formatDateDisplay(event.start as string)}
                        </span>
                    </InfoRow>

                    {event.extendedProps?.attendees?.length ? (
                        <InfoRow icon={<Users className="size-[15px]" strokeWidth={1.4} />} label="Attendees">
                            <div className="flex flex-wrap gap-1.5">
                                {event.extendedProps.attendees.map((attendee: string) => (
                                    <span
                                        key={attendee}
                                        className="border border-[var(--hairline)] px-2 py-0.5 text-[0.7rem] text-[var(--bone-muted)]"
                                    >
                                        {attendee}
                                    </span>
                                ))}
                            </div>
                        </InfoRow>
                    ) : null}

                    {event.extendedProps?.description ? (
                        <InfoRow icon={<Pencil className="size-[15px]" strokeWidth={1.4} />} label="Notes">
                            <p className="text-[0.82rem] leading-relaxed text-[var(--bone-muted)]">
                                {event.extendedProps.description}
                            </p>
                        </InfoRow>
                    ) : null}
                </dl>
            </div>

            {(canManage || cancelError) && (
                <div className="mt-6 border-t border-[var(--hairline)] pt-5">
                    {cancelError && (
                        <p className="mb-3 border border-red-400/30 bg-red-500/10 px-3 py-2 text-[0.75rem] text-red-200">
                            {cancelError}
                        </p>
                    )}
                    {canManage && !cancelConfirmOpen && (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={onEdit}
                                disabled={isCancelling}
                                className="flex cursor-pointer items-center justify-center gap-2 border border-[var(--hairline)] py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] text-[var(--bone-muted)] uppercase transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Pencil className="size-4" strokeWidth={1.6} />
                                <span>Edit</span>
                            </button>
                            <button
                                type="button"
                                onClick={onRequestCancel}
                                disabled={isCancelling}
                                aria-label="Cancel booking"
                                className="flex cursor-pointer items-center justify-center gap-2 border border-red-300/50 bg-red-500/10 py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] text-red-100 uppercase transition-all hover:border-red-200 hover:bg-red-500/20 hover:text-white disabled:cursor-wait disabled:opacity-70"
                            >
                                <Ban className="size-4" strokeWidth={1.6} />
                                <span>Cancel</span>
                            </button>
                        </div>
                    )}
                    {canManage && cancelConfirmOpen && (
                        <BookingCancelConfirm
                            cancelReason={cancelReason}
                            isCancelling={isCancelling}
                            onCancelReasonChange={onCancelReasonChange}
                            onCancelConfirmClose={onCancelConfirmClose}
                            onConfirmCancel={onConfirmCancel}
                        />
                    )}
                </div>
            )}
        </DialogContent>
    </Dialog>
);

const BookingCancelConfirm = ({
    cancelReason,
    isCancelling,
    onCancelReasonChange,
    onCancelConfirmClose,
    onConfirmCancel,
}: {
    cancelReason: string;
    isCancelling: boolean;
    onCancelReasonChange: (reason: string) => void;
    onCancelConfirmClose: () => void;
    onConfirmCancel: () => void;
}) => (
    <div className="space-y-3">
        <p className="text-[0.78rem] leading-snug text-[var(--bone-muted)]">Cancel this booking?</p>
        <div className="space-y-2">
            <Label className="eyebrow block">
                Reason <span className="ml-1 text-[var(--bone-faint)]">(optional)</span>
            </Label>
            <Textarea
                value={cancelReason}
                onChange={(e) => onCancelReasonChange(e.target.value)}
                placeholder="Change of plans, room no longer needed..."
                rows={3}
                className="resize-none rounded-none border border-[var(--hairline)] bg-[var(--surface-02)] px-3 py-2.5 text-[0.84rem] leading-relaxed text-[var(--bone)] shadow-none placeholder:text-[var(--bone-faint)] focus:border-[var(--gold)] focus-visible:ring-0"
            />
        </div>
        <div className="flex items-center justify-end gap-3">
            <button
                type="button"
                onClick={onCancelConfirmClose}
                disabled={isCancelling}
                className="h-9 cursor-pointer border border-[var(--hairline)] px-4 text-[0.62rem] font-semibold tracking-[0.24em] text-[var(--bone-muted)] uppercase transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)] disabled:cursor-not-allowed disabled:opacity-60"
            >
                Keep
            </button>
            <button
                type="button"
                onClick={onConfirmCancel}
                disabled={isCancelling}
                className="flex h-9 cursor-pointer items-center justify-center gap-2 border border-red-300/50 bg-red-500/10 px-4 text-[0.62rem] font-semibold tracking-[0.24em] text-red-100 uppercase transition-all hover:border-red-200 hover:bg-red-500/20 hover:text-white disabled:cursor-wait disabled:opacity-70"
            >
                <Ban className="size-3.5" strokeWidth={1.6} />
                <span>{isCancelling ? "Cancelling" : "Confirm"}</span>
            </button>
        </div>
    </div>
);

const AttendeePickerDialog = ({
    open,
    onOpenChange,
    users,
    selectedIds,
    onCommit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    users: BookableUser[];
    selectedIds: string[];
    onCommit: (ids: string[]) => void;
}) => {
    const [search, setSearch] = useState("");
    const [draftIds, setDraftIds] = useState<string[]>([]);

    useEffect(() => {
        if (!open) return;

        setSearch("");
        setDraftIds(selectedIds);
    }, [open, selectedIds]);

    const normalizedSearch = search.trim().toLowerCase();
    const filteredUsers =
        normalizedSearch.length === 0
            ? users
            : users.filter(
                  (user) =>
                      user.name.toLowerCase().includes(normalizedSearch) ||
                      user.email.toLowerCase().includes(normalizedSearch),
              );
    const selectedUsers = users.filter((user) => draftIds.includes(user.id));

    const toggleUser = (userId: string) => {
        setDraftIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    };
    const removeUser = (userId: string) => {
        setDraftIds((prev) => prev.filter((id) => id !== userId));
    };
    const handleDone = () => {
        onCommit(draftIds);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`${DIALOG_CLASS} sm:max-w-2xl`}>
                <DialogHeader>
                    <p className="eyebrow eyebrow-gold">Invite</p>
                    <DialogTitle className="mt-2 display-italic text-[1.75rem] leading-[1.05] font-normal text-[var(--bone)]">
                        Select attendees.
                    </DialogTitle>
                    <DialogDescription className="text-[0.78rem] text-[var(--bone-muted)]">
                        Selected users will be attached when the booking is submitted.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4 border-t border-[var(--hairline)] pt-6">
                    <div className="relative">
                        <Search
                            aria-hidden
                            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--bone-dim)]"
                            strokeWidth={1.5}
                        />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search users..."
                            aria-label="Search users"
                            className="h-10 rounded-none border border-[var(--hairline)] bg-[var(--surface-02)] pr-3 pl-10 text-[0.9rem] text-[var(--bone)] shadow-none placeholder:text-[var(--bone-faint)] focus-visible:ring-0 focus:border-[var(--gold)]"
                        />
                    </div>

                    <div className="min-h-10 border border-[var(--hairline)] bg-[var(--surface-02)] px-3 py-2">
                        {selectedUsers.length === 0 ? (
                            <p className="py-1 text-[0.72rem] text-[var(--bone-dim)]">No attendees selected.</p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {selectedUsers.map((user) => (
                                    <span
                                        key={user.id}
                                        className="inline-flex items-center gap-1 border border-[var(--hairline)] bg-[var(--surface-01)] px-2 py-0.5 text-[0.7rem] text-[var(--bone-muted)]"
                                    >
                                        {user.name}
                                        <button
                                            type="button"
                                            onClick={() => removeUser(user.id)}
                                            aria-label={`Remove ${user.name}`}
                                            className="ml-0.5 cursor-pointer text-[var(--bone-dim)] transition-colors hover:text-[var(--gold)]"
                                        >
                                            <X className="size-3" strokeWidth={1.6} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-[min(420px,50dvh)] border border-[var(--hairline)] bg-black/20">
                        <LegendList
                            data={filteredUsers}
                            renderItem={({ item }) => {
                                const checked = draftIds.includes(item.id);
                                const inputId = `attendee-${item.id}`;
                                return (
                                    <label
                                        htmlFor={inputId}
                                        aria-label={`Invite ${item.name} (${item.email})`}
                                        className="flex min-h-14 cursor-pointer items-center gap-3 border-b border-[var(--hairline)] px-4 py-2 transition-colors hover:bg-[var(--gold-wash)]"
                                    >
                                        <input
                                            id={inputId}
                                            aria-label={`${item.name} ${item.email}`}
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleUser(item.id)}
                                            className="size-4 accent-[var(--gold)]"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[0.84rem] font-medium text-[var(--bone)]">
                                                {item.name}
                                            </span>
                                            <span className="block truncate text-[0.68rem] text-[var(--bone-dim)]">
                                                {item.email}
                                            </span>
                                        </span>
                                    </label>
                                );
                            }}
                            keyExtractor={(user) => user.id}
                            recycleItems
                            extraData={draftIds}
                            estimatedItemSize={56}
                            getFixedItemSize={() => 56}
                            style={{ height: "100%" }}
                            ListEmptyComponent={
                                <p className="px-4 py-5 text-[0.78rem] text-[var(--bone-dim)]">
                                    No users match your search.
                                </p>
                            }
                        />
                    </div>
                </div>

                <div className="mt-2 flex gap-3 border-t border-[var(--hairline)] pt-5">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 cursor-pointer border border-[var(--hairline)] py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-[var(--bone-muted)] transition-all hover:border-[var(--hairline-strong)] hover:text-[var(--bone)]"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDone}
                        className="flex flex-1 cursor-pointer items-center justify-center border border-[var(--bone)] bg-[var(--bone)] py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] uppercase text-black transition-all hover:bg-white hover:tracking-[0.32em]"
                    >
                        Done
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const InfoRow = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
    <div className="grid grid-cols-[88px_1fr] items-start gap-4">
        <div className="flex items-center gap-2 pt-[2px]">
            <span className="text-[var(--bone-dim)]">{icon}</span>
            <span className="eyebrow">{label}</span>
        </div>
        <div className="flex flex-wrap items-baseline">{children}</div>
    </div>
);
