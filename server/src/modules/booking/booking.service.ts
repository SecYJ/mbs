import { isAdminRole } from "@mbs/shared/roles";

import { db, type Database } from "#app/db/index";
import { ForbiddenError } from "#app/errors/forbiddenError";
import { NotFoundError } from "#app/errors/notFoundError";
import { ValidationError } from "#app/errors/validationError";
import { formatBookingSlot } from "#app/modules/booking/booking.format";
import * as repo from "#app/modules/booking/booking.repo";
import type {
    BookingEventsInput,
    BookingRoomFilters,
    BookingRsvpInput,
    CancelBookingInput,
    CreateBookingInput,
    UpdateBookingInput,
} from "#app/modules/booking/booking.schema";

export async function getBookingCalendarDataService(userId: string, userRole: string) {
    const [rooms, users] = await Promise.all([
        repo.getBookingRooms({ capacity: 0, equipment: [], location: [] }),
        repo.getBookingUsers(userId),
    ]);
    return { currentUserId: userId, currentUserRole: userRole, rooms, users };
}

export async function getBookingEventsService(userId: string, input: BookingEventsInput) {
    const events = await repo.getBookingEvents(userId, input);
    return events.map((event) => ({ ...event, start: event.start.toISOString(), end: event.end.toISOString() }));
}

export async function getBookingRoomsService(filters: BookingRoomFilters) {
    return { rooms: await repo.getBookingRooms(filters) };
}

export async function getBookingRoomService(roomId: string) {
    const room = await repo.getBookingRoom(roomId);
    if (!room) throw new NotFoundError("Room no longer exists");
    return room;
}

export async function getBookingRoomCatalogService() {
    return repo.getBookingRoomCatalog();
}

export async function getBookingSummaryService() {
    return repo.getBookingSummary();
}

export async function getBookingDetailsService(userId: string, bookingId: string) {
    const details = await repo.getBookingDetails(userId, bookingId);
    if (!details) throw new NotFoundError("Booking no longer exists");

    return {
        ...details,
        booking: {
            ...details.booking,
            start: details.booking.start.toISOString(),
            end: details.booking.end.toISOString(),
            cancelledAt: details.booking.cancelledAt?.toISOString() ?? null,
            createdAt: details.booking.createdAt?.toISOString() ?? null,
            updatedAt: details.booking.updatedAt?.toISOString() ?? null,
        },
    };
}

function getAttendeeIds(attendeeIds: string[], organizerId: string) {
    return [...new Set(attendeeIds.filter((id) => id && id !== organizerId))];
}

async function validateAttendees(attendeeIds: string[], database: Database) {
    if (attendeeIds.length > 0 && (await repo.getExistingAttendeeCount(attendeeIds, database)) !== attendeeIds.length) {
        throw new ValidationError("One or more selected attendees no longer exist");
    }
}

type Overlap = NonNullable<Awaited<ReturnType<typeof repo.getOverlappingBooking>>>;

function getOverlapMessage(overlap: Overlap) {
    const title = overlap.title.trim();
    return `${overlap.roomName} is occupied on ${formatBookingSlot(overlap.startTime, overlap.endTime)}${title ? ` for "${title}"` : ""}. Choose a different time or room.`;
}

// PostgreSQL reports "exclusion_violation" (23P01) when the bookings_no_room_overlap constraint rejects a row.
// Drizzle wraps the driver error, so look through the cause chain.
function isExclusionViolation(error: unknown) {
    for (let current = error; current instanceof Error; current = current.cause) {
        if ("code" in current && current.code === "23P01") return true;
    }
    return false;
}

type ScheduleSlot = { roomId: string; startTime: Date; endTime: Date; excludedBookingId?: string };

// The overlap check below normally catches conflicts first. If two requests still race past it, the database
// constraint rejects the second one; turn that into the same friendly message.
async function withOverlapErrorMapping<T>(slot: ScheduleSlot, write: () => Promise<T>) {
    try {
        return await write();
    } catch (error) {
        if (!isExclusionViolation(error)) throw error;
        // The failed transaction is gone, so look up the blocking booking on a fresh connection.
        const overlap = await repo.getOverlappingBooking(
            slot.roomId,
            slot.startTime,
            slot.endTime,
            slot.excludedBookingId,
            db,
        );
        throw new ValidationError(
            overlap
                ? getOverlapMessage(overlap)
                : "This room is already booked for that time. Choose a different time or room.",
        );
    }
}

async function validateSchedule(
    { roomId, startTime, endTime, excludedBookingId }: ScheduleSlot,
    requireFutureStart: boolean,
    database: Database,
) {
    if (requireFutureStart && startTime.getTime() <= Date.now()) {
        throw new ValidationError("Start time must be in the future");
    }
    if (endTime <= startTime) throw new ValidationError("End time must be after start time");
    if (endTime.getTime() <= Date.now()) throw new ValidationError("End time must be in the future");

    // Hold the room lock until the booking and notifications commit, so concurrent requests cannot overlap.
    const room = await repo.lockBookingRoom(roomId, database);
    if (!room) throw new NotFoundError("Selected room no longer exists");
    if (endTime.getTime() - startTime.getTime() > room.maxBookingDurationHours * 60 * 60 * 1000) {
        throw new ValidationError(`Bookings cannot exceed ${room.maxBookingDurationHours} hours for this room`);
    }
    if (!room.available) throw new ValidationError("Selected room is not available for booking");

    const overlap = await repo.getOverlappingBooking(roomId, startTime, endTime, excludedBookingId, database);
    if (overlap) throw new ValidationError(getOverlapMessage(overlap));
}

export async function createBookingService(userId: string, input: CreateBookingInput) {
    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);
    const attendeeIds = getAttendeeIds(input.attendeeIds, userId);

    return withOverlapErrorMapping({ roomId: input.roomId, startTime, endTime }, () =>
        db.transaction(async (tx) => {
            await validateAttendees(attendeeIds, tx);
            await validateSchedule({ roomId: input.roomId, startTime, endTime }, true, tx);
            const booking = await repo.insertBooking(
                userId,
                {
                    roomId: input.roomId,
                    title: input.title,
                    description: input.description || null,
                    startTime,
                    endTime,
                },
                tx,
            );
            if (!booking) throw new ValidationError("Failed to create booking");
            const invitedIds = await repo.addBookingAttendees(booking.id, attendeeIds, tx);
            await repo.insertBookingNotifications(booking.id, invitedIds, `You've been invited to: ${input.title}`, tx);
            return booking;
        }),
    );
}

export async function updateBookingService(userId: string, input: UpdateBookingInput) {
    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);
    const attendeeIds = getAttendeeIds(input.attendeeIds, userId);
    const slot = { roomId: input.roomId, startTime, endTime, excludedBookingId: input.bookingId };

    return withOverlapErrorMapping(slot, () =>
        db.transaction(async (tx) => {
            // Match room deletion's lock order: acquire the room before the booking.
            await repo.lockBookingRoom(input.roomId, tx);
            const existing = await repo.getBookingForChange(input.bookingId, tx);
            if (!existing) throw new NotFoundError("Booking no longer exists");
            if (existing.userId !== userId) throw new ForbiddenError("You can only edit bookings you created");
            if (existing.status === "cancelled") throw new ValidationError("Cancelled bookings cannot be edited");
            if (existing.endTime.getTime() <= Date.now()) throw new ValidationError("Past bookings cannot be edited");

            // A meeting that is already running can still be edited, as long as its start time stays the same.
            const startChanged = startTime.getTime() !== existing.startTime.getTime();
            const scheduleChanged =
                startChanged || input.roomId !== existing.roomId || endTime.getTime() !== existing.endTime.getTime();
            await validateAttendees(attendeeIds, tx);
            if (scheduleChanged) await validateSchedule(slot, startChanged, tx);

            const updated = await repo.updateBooking(
                input.bookingId,
                userId,
                {
                    roomId: input.roomId,
                    title: input.title,
                    description: input.description || null,
                    startTime,
                    endTime,
                },
                tx,
            );
            if (!updated) throw new ValidationError("Failed to update booking");

            // Keep existing attendee rows so their RSVP answers survive; only add and remove the differences.
            const removedIds = await repo.removeBookingAttendeesExcept(input.bookingId, attendeeIds, tx);
            const addedIds = await repo.addBookingAttendees(input.bookingId, attendeeIds, tx);
            const keptIds = attendeeIds.filter((attendeeId) => !addedIds.includes(attendeeId));
            await repo.insertBookingNotifications(
                input.bookingId,
                addedIds,
                `You've been invited to: ${input.title}`,
                tx,
            );
            await repo.insertBookingNotifications(input.bookingId, keptIds, `Booking updated: ${input.title}`, tx);
            await repo.insertBookingNotifications(
                input.bookingId,
                removedIds,
                `You've been removed from: ${input.title}`,
                tx,
            );
            return updated;
        }),
    );
}

export async function cancelBookingService(
    userId: string,
    userRole: string,
    input: CancelBookingInput,
    notifyOrganizer = false,
) {
    return db.transaction(async (tx) => {
        const booking = await repo.getBookingForChange(input.bookingId, tx);
        if (!booking) throw new NotFoundError("Booking no longer exists");
        const isOrganizer = booking.userId === userId;
        const isAdmin = isAdminRole(userRole);
        if (!isOrganizer && !isAdmin) {
            throw new ForbiddenError("Only an admin or the booking creator can cancel this booking");
        }
        if (booking.status === "cancelled") throw new ValidationError("Booking is already cancelled");
        if (booking.endTime.getTime() <= Date.now()) throw new ValidationError("Past bookings cannot be cancelled");

        // When someone else cancels, the organizer needs to hear about it too.
        const recipientIds = await repo.getBookingRecipientIds(input.bookingId, notifyOrganizer || !isOrganizer, tx);
        const updated = await repo.cancelBooking(input.bookingId, userId, isAdmin, input.cancelReason, tx);
        if (!updated) throw new ValidationError("Failed to cancel booking");

        const message = `Booking canceled: ${booking.title} in ${booking.roomName}, ${booking.roomLocation} on ${formatBookingSlot(booking.startTime, booking.endTime)}`;
        await repo.insertBookingNotifications(input.bookingId, recipientIds, message, tx);
        return updated;
    });
}

export async function rsvpBookingService(userId: string, input: BookingRsvpInput) {
    return db.transaction(async (tx) => {
        const booking = await repo.getBookingForChange(input.bookingId, tx);
        if (!booking) throw new NotFoundError("Booking no longer exists");
        if (booking.status === "cancelled") throw new ValidationError("Cancelled bookings cannot receive RSVP updates");
        if (booking.endTime.getTime() <= Date.now())
            throw new ValidationError("Past bookings cannot receive RSVP updates");
        const updated = await repo.updateBookingAttendance(input.bookingId, userId, input.status, tx);
        if (!updated) throw new ForbiddenError("Only invited attendees can RSVP to this booking");
        await repo.markBookingNotificationsRead(input.bookingId, userId, tx);
        return updated;
    });
}
