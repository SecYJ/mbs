import { isSuperAdminRole } from "@mbs/shared/roles";

import { db, type Database } from "#app/db/index";
import { ForbiddenError } from "#app/errors/forbiddenError";
import { NotFoundError } from "#app/errors/notFoundError";
import { ValidationError } from "#app/errors/validationError";
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
    return repo.getBookingRoom(roomId);
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

function formatBookingDate(value: Date, timeZone?: string) {
    return value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone });
}

function formatBookingTime(value: Date, timeZone?: string) {
    return value.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone });
}

function getAttendeeIds(attendeeIds: string[], organizerId: string) {
    return [...new Set(attendeeIds.filter((id) => id && id !== organizerId))];
}

async function validateAttendees(attendeeIds: string[], database: Database) {
    if (attendeeIds.length > 0 && (await repo.getExistingAttendeeCount(attendeeIds, database)) !== attendeeIds.length) {
        throw new ValidationError("One or more selected attendees no longer exist");
    }
}

async function validateSchedule(
    input: CreateBookingInput,
    startTime: Date,
    endTime: Date,
    database: Database,
    excludedBookingId?: string,
) {
    if (startTime.getTime() <= Date.now()) throw new ValidationError("Start time must be in the future");
    if (endTime <= startTime) throw new ValidationError("End time must be after start time");

    // Hold the room lock until the booking and notifications commit, so concurrent requests cannot overlap.
    const room = await repo.lockBookingRoom(input.roomId, database);
    if (!room) throw new NotFoundError("Selected room no longer exists");
    if (endTime.getTime() - startTime.getTime() > room.maxBookingDurationHours * 60 * 60 * 1000) {
        throw new ValidationError(`Bookings cannot exceed ${room.maxBookingDurationHours} hours for this room`);
    }
    if (!room.available) throw new ValidationError("Selected room is not available for booking");

    const overlap = await repo.getOverlappingBooking(input.roomId, startTime, endTime, excludedBookingId, database);
    if (overlap) {
        const title = overlap.title.trim();
        throw new ValidationError(
            `${overlap.roomName} is occupied on ${formatBookingDate(overlap.startTime)} from ${formatBookingTime(overlap.startTime)} to ${formatBookingTime(overlap.endTime)}${title ? ` for "${title}"` : ""}. Choose a different time or room.`,
        );
    }
}

export async function createBookingService(userId: string, input: CreateBookingInput) {
    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);
    const attendeeIds = getAttendeeIds(input.attendeeIds, userId);

    return db.transaction(async (tx) => {
        await validateAttendees(attendeeIds, tx);
        await validateSchedule(input, startTime, endTime, tx);
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
        await repo.replaceBookingAttendees(booking.id, attendeeIds, tx);
        await repo.insertBookingNotifications(booking.id, attendeeIds, `You've been invited to: ${input.title}`, tx);
        return booking;
    });
}

export async function updateBookingService(userId: string, input: UpdateBookingInput) {
    return db.transaction(async (tx) => {
        // Match room deletion's lock order: acquire the room before the booking.
        await repo.lockBookingRoom(input.roomId, tx);
        const existing = await repo.getBookingForChange(input.bookingId, tx);
        if (!existing) throw new NotFoundError("Booking no longer exists");
        if (existing.userId !== userId) throw new ForbiddenError("You can only edit bookings you created");
        if (existing.endTime.getTime() <= Date.now()) throw new ValidationError("Past bookings cannot be edited");

        const startTime = new Date(input.startTime);
        const endTime = new Date(input.endTime);
        if (startTime.getTime() <= Date.now()) throw new ValidationError("Start time must be in the future");
        if (endTime <= startTime) throw new ValidationError("End time must be after start time");
        const attendeeIds = getAttendeeIds(input.attendeeIds, userId);
        const scheduleChanged =
            input.roomId !== existing.roomId ||
            startTime.getTime() !== existing.startTime.getTime() ||
            endTime.getTime() !== existing.endTime.getTime();
        await validateAttendees(attendeeIds, tx);
        if (scheduleChanged) await validateSchedule(input, startTime, endTime, tx, input.bookingId);

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
        await repo.replaceBookingAttendees(input.bookingId, attendeeIds, tx);
        await repo.insertBookingNotifications(input.bookingId, attendeeIds, `Booking updated: ${input.title}`, tx);
        return updated;
    });
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
        const isSuperAdmin = isSuperAdminRole(userRole);
        if (booking.userId !== userId && !isSuperAdmin) {
            throw new ForbiddenError("Only a super admin or the booking creator can cancel this booking");
        }
        if (booking.status === "cancelled") throw new ValidationError("Booking is already cancelled");
        if (booking.endTime.getTime() <= Date.now()) throw new ValidationError("Past bookings cannot be cancelled");

        const attendeeIds = await repo.getBookingAttendeeIds(input.bookingId, tx);
        const recipientIds = notifyOrganizer ? [...new Set([...attendeeIds, booking.userId])] : attendeeIds;
        const updated = await repo.cancelBooking(input.bookingId, userId, isSuperAdmin, input.cancelReason, tx);
        if (!updated) throw new ValidationError("Failed to cancel booking");

        const message = `Booking canceled: ${booking.title} in ${booking.roomName}, ${booking.roomLocation} on ${formatBookingDate(booking.startTime, "UTC")} from ${formatBookingTime(booking.startTime, "UTC")} to ${formatBookingTime(booking.endTime, "UTC")}`;
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
