import { attendees, bookings, equipment, notifications, roomEquipment, rooms, user } from "@mbs/shared/db/schema";
import { and, asc, count, countDistinct, eq, gt, gte, inArray, lt, ne, notInArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db, type Database } from "#app/db/index";
import type { BookingEventsInput, BookingRoomFilters } from "#app/modules/booking/booking.schema";

type BookingAttendee = {
    id: string;
    name: string;
    email: string;
    status: "pending" | "accepted" | "declined";
};

type BookingEquipment = {
    name: string;
    brand: string;
    model: string;
};

const attendeeUser = alias(user, "booking_attendee_user");
const cancelledByUser = alias(user, "booking_cancelled_by_user");

function getBookableRoomConditions(filters: BookingRoomFilters) {
    const conditions = [eq(rooms.available, true)];

    if (filters.capacity > 0) {
        conditions.push(gte(rooms.capacity, filters.capacity));
    }
    if (filters.location.length > 0) {
        conditions.push(inArray(rooms.location, filters.location));
    }
    if (filters.equipment.length > 0) {
        conditions.push(
            inArray(
                rooms.roomId,
                db
                    .select({ roomId: roomEquipment.roomId })
                    .from(roomEquipment)
                    .innerJoin(equipment, eq(equipment.equipmentId, roomEquipment.equipmentId))
                    .where(inArray(equipment.name, filters.equipment))
                    .groupBy(roomEquipment.roomId)
                    .having(eq(countDistinct(equipment.name), filters.equipment.length)),
            ),
        );
    }

    return conditions;
}

function getBookingRoomSelection() {
    const equipmentNames = db
        .select({
            value: sql<
                string[]
            >`coalesce(jsonb_agg(distinct ${equipment.name} order by ${equipment.name}), '[]'::jsonb)`,
        })
        .from(roomEquipment)
        .innerJoin(equipment, eq(equipment.equipmentId, roomEquipment.equipmentId))
        .where(eq(roomEquipment.roomId, rooms.roomId));

    return {
        id: rooms.roomId,
        title: rooms.name,
        location: rooms.location,
        capacity: rooms.capacity,
        maxBookingDurationHours: rooms.maxBookingDurationHours,
        available: rooms.available,
        equipment: sql<string[]>`(${equipmentNames})`,
    };
}

export async function getBookingRooms(filters: BookingRoomFilters) {
    return db
        .select(getBookingRoomSelection())
        .from(rooms)
        .where(and(...getBookableRoomConditions(filters)))
        .orderBy(asc(rooms.name));
}

export async function getBookingRoom(roomId: string) {
    const result = await db.select(getBookingRoomSelection()).from(rooms).where(eq(rooms.roomId, roomId)).limit(1);

    return result.at(0) ?? null;
}

export async function getBookingUsers(excludedUserId: string) {
    return db
        .select({ id: user.id, name: user.name, email: user.email })
        .from(user)
        .where(ne(user.id, excludedUserId))
        .orderBy(asc(user.name));
}

export async function getBookingEvents(userId: string, input: BookingEventsInput) {
    const roomScope = input.roomId
        ? eq(bookings.roomId, input.roomId)
        : inArray(
              bookings.roomId,
              db
                  .select({ roomId: rooms.roomId })
                  .from(rooms)
                  .where(and(...getBookableRoomConditions(input))),
          );

    // Use the same order for both arrays so each name stays paired with its ID.
    const visibleAttendeeNames = db
        .select({
            value: sql<
                string[]
            >`coalesce(jsonb_agg(${attendeeUser.name} order by ${attendeeUser.name}, ${attendeeUser.id}), '[]'::jsonb)`,
        })
        .from(attendees)
        .innerJoin(attendeeUser, eq(attendeeUser.id, attendees.userId))
        .where(and(eq(attendees.bookingId, bookings.bookingId), ne(attendees.userId, userId)));

    const visibleAttendeeIds = db
        .select({
            value: sql<
                string[]
            >`coalesce(jsonb_agg(${attendeeUser.id} order by ${attendeeUser.name}, ${attendeeUser.id}), '[]'::jsonb)`,
        })
        .from(attendees)
        .innerJoin(attendeeUser, eq(attendeeUser.id, attendees.userId))
        .where(and(eq(attendees.bookingId, bookings.bookingId), ne(attendees.userId, userId)));

    return db
        .select({
            id: bookings.bookingId,
            resourceId: bookings.roomId,
            title: bookings.title,
            start: bookings.startTime,
            end: bookings.endTime,
            extendedProps: {
                resourceId: bookings.roomId,
                organizer: user.name,
                attendees: sql<string[]>`(${visibleAttendeeNames})`,
                attendeeIds: sql<string[]>`(${visibleAttendeeIds})`,
                description: sql<string>`coalesce(${bookings.description}, '')`,
                canManage: sql<boolean>`${bookings.userId} = ${userId} and ${bookings.endTime} > now()`,
            },
        })
        .from(bookings)
        .innerJoin(user, eq(user.id, bookings.userId))
        .where(
            and(
                eq(bookings.status, "active"),
                lt(bookings.startTime, new Date(input.rangeEnd)),
                gt(bookings.endTime, new Date(input.rangeStart)),
                roomScope,
            ),
        )
        .orderBy(asc(bookings.startTime));
}

export async function getBookingRoomCatalog() {
    const equipmentNames = db
        .select({
            value: sql<
                string[]
            >`coalesce(jsonb_agg(distinct ${equipment.name} order by ${equipment.name}), '[]'::jsonb)`,
        })
        .from(equipment)
        .innerJoin(roomEquipment, eq(roomEquipment.equipmentId, equipment.equipmentId))
        .innerJoin(rooms, eq(rooms.roomId, roomEquipment.roomId))
        .where(eq(rooms.available, true));

    const locations = db
        .select({
            value: sql<
                string[]
            >`coalesce(jsonb_agg(distinct ${rooms.location} order by ${rooms.location}), '[]'::jsonb)`,
        })
        .from(rooms)
        .where(eq(rooms.available, true));

    const [catalog] = await db
        .select({
            totalRoomCount: count(),
            allEquipment: sql<string[]>`(${equipmentNames})`,
            allLocations: sql<string[]>`(${locations})`,
        })
        .from(rooms)
        .where(eq(rooms.available, true));

    return catalog;
}

export async function getBookingSummary() {
    const [summary] = await db
        .select({
            bookingCount: count(),
            liveBookingCount:
                sql<number>`count(*) filter (where ${bookings.startTime} <= now() and ${bookings.endTime} > now())`.mapWith(
                    Number,
                ),
        })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .where(and(eq(bookings.status, "active"), eq(rooms.available, true)));

    return summary;
}

export async function getBookingDetails(userId: string, bookingId: string) {
    const visibleAttendees = db
        .select({
            value: sql<BookingAttendee[]>`coalesce(
                jsonb_agg(jsonb_build_object(
                    'id', ${attendeeUser.id},
                    'name', ${attendeeUser.name},
                    'email', ${attendeeUser.email},
                    'status', ${attendees.status}
                ) order by ${attendeeUser.name}, ${attendeeUser.id}),
                '[]'::jsonb
            )`,
        })
        .from(attendees)
        .innerJoin(attendeeUser, eq(attendeeUser.id, attendees.userId))
        .where(and(eq(attendees.bookingId, bookings.bookingId), ne(attendees.userId, userId)));

    const currentUserAttendance = db
        .select({ value: sql<Pick<BookingAttendee, "status">>`jsonb_build_object('status', ${attendees.status})` })
        .from(attendees)
        .where(and(eq(attendees.bookingId, bookings.bookingId), eq(attendees.userId, userId)))
        .limit(1);

    const roomEquipmentDetails = db
        .select({
            value: sql<BookingEquipment[]>`coalesce(
                jsonb_agg(jsonb_build_object(
                    'name', ${equipment.name},
                    'brand', ${equipment.brand},
                    'model', ${equipment.model}
                ) order by ${equipment.name}, ${equipment.equipmentId}),
                '[]'::jsonb
            )`,
        })
        .from(roomEquipment)
        .innerJoin(equipment, eq(equipment.equipmentId, roomEquipment.equipmentId))
        .where(eq(roomEquipment.roomId, bookings.roomId));

    const result = await db
        .select({
            booking: {
                id: bookings.bookingId,
                title: bookings.title,
                description: sql<string>`coalesce(${bookings.description}, '')`,
                start: bookings.startTime,
                end: bookings.endTime,
                status: bookings.status,
                cancelledAt: bookings.cancelledAt,
                cancelReason: sql<string>`coalesce(${bookings.cancelReason}, '')`,
                createdAt: bookings.createdAt,
                updatedAt: bookings.updatedAt,
            },
            room: {
                id: rooms.roomId,
                name: rooms.name,
                location: rooms.location,
                capacity: rooms.capacity,
                maxBookingDurationHours: rooms.maxBookingDurationHours,
                available: rooms.available,
            },
            organizer: { id: user.id, name: user.name, email: user.email },
            cancelledBy: { id: cancelledByUser.id, name: cancelledByUser.name, email: cancelledByUser.email },
            equipment: sql<BookingEquipment[]>`(${roomEquipmentDetails})`,
            attendees: sql<BookingAttendee[]>`(${visibleAttendees})`,
            currentUserAttendance: sql<Pick<BookingAttendee, "status"> | null>`(${currentUserAttendance})`,
            isOrganizer: sql<boolean>`${bookings.userId} = ${userId}`,
            canRespond: sql<boolean>`(${currentUserAttendance}) is not null and ${bookings.status} = 'active' and ${bookings.endTime} > now()`,
        })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .innerJoin(user, eq(user.id, bookings.userId))
        .leftJoin(cancelledByUser, eq(cancelledByUser.id, bookings.cancelledBy))
        .where(eq(bookings.bookingId, bookingId))
        .limit(1);

    return result.at(0) ?? null;
}

export async function getBookingForChange(bookingId: string, database: Database) {
    const result = await database
        .select({
            id: bookings.bookingId,
            roomId: bookings.roomId,
            userId: bookings.userId,
            title: bookings.title,
            status: bookings.status,
            startTime: bookings.startTime,
            endTime: bookings.endTime,
            roomName: rooms.name,
            roomLocation: rooms.location,
        })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .where(eq(bookings.bookingId, bookingId))
        .limit(1)
        .for("update", { of: bookings });

    return result.at(0);
}

export async function lockBookingRoom(roomId: string, database: Database) {
    const result = await database
        .select({ available: rooms.available, maxBookingDurationHours: rooms.maxBookingDurationHours })
        .from(rooms)
        .where(eq(rooms.roomId, roomId))
        .limit(1)
        .for("update");

    return result.at(0);
}

export async function getExistingAttendeeCount(attendeeIds: string[], database: Database) {
    const [result] = await database.select({ value: count() }).from(user).where(inArray(user.id, attendeeIds));
    return result.value;
}

export async function getOverlappingBooking(
    roomId: string,
    startTime: Date,
    endTime: Date,
    excludedBookingId: string | undefined,
    database: Database,
) {
    const result = await database
        .select({
            title: bookings.title,
            roomName: rooms.name,
            startTime: bookings.startTime,
            endTime: bookings.endTime,
        })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .where(
            and(
                eq(bookings.roomId, roomId),
                eq(bookings.status, "active"),
                lt(bookings.startTime, endTime),
                gt(bookings.endTime, startTime),
                excludedBookingId ? ne(bookings.bookingId, excludedBookingId) : undefined,
            ),
        )
        .orderBy(asc(bookings.startTime))
        .limit(1);
    return result.at(0);
}

type BookingWrite = Pick<typeof bookings.$inferInsert, "roomId" | "title" | "description" | "startTime" | "endTime">;

export async function insertBooking(userId: string, input: BookingWrite, database: Database) {
    const [booking] = await database
        .insert(bookings)
        .values({ ...input, userId })
        .returning({ id: bookings.bookingId });
    return booking;
}

export async function updateBooking(bookingId: string, userId: string, input: BookingWrite, database: Database) {
    const result = await database
        .update(bookings)
        .set({ ...input, updatedAt: new Date() })
        .where(and(eq(bookings.bookingId, bookingId), eq(bookings.userId, userId), eq(bookings.status, "active")))
        .returning({ id: bookings.bookingId });
    return result.at(0);
}

// Inserts only attendees that are not already on the booking (they start as pending) and returns the new IDs.
// Existing rows are left alone, so an attendee who already accepted or declined keeps that answer.
export async function addBookingAttendees(bookingId: string, attendeeIds: string[], database: Database) {
    if (attendeeIds.length === 0) return [];

    const added = await database
        .insert(attendees)
        .values(attendeeIds.map((userId) => ({ bookingId, userId })))
        .onConflictDoNothing()
        .returning({ userId: attendees.userId });
    return added.map((row) => row.userId);
}

// Deletes every attendee that is not in keptIds and returns the deleted IDs.
export async function removeBookingAttendeesExcept(bookingId: string, keptIds: string[], database: Database) {
    const removed = await database
        .delete(attendees)
        .where(
            and(
                eq(attendees.bookingId, bookingId),
                keptIds.length > 0 ? notInArray(attendees.userId, keptIds) : undefined,
            ),
        )
        .returning({ userId: attendees.userId });
    return removed.map((row) => row.userId);
}

export async function insertBookingNotifications(
    bookingId: string,
    recipientIds: string[],
    message: string,
    database: Database,
) {
    if (recipientIds.length > 0) {
        await database.insert(notifications).values(recipientIds.map((userId) => ({ bookingId, userId, message })));
    }
}

// Attendees of the booking, plus its organizer when requested. UNION removes duplicates, so nobody is notified twice.
export async function getBookingRecipientIds(bookingId: string, includeOrganizer: boolean, database: Database) {
    const attendeeRecipients = database
        .select({ userId: attendees.userId })
        .from(attendees)
        .where(eq(attendees.bookingId, bookingId));
    const recipients = includeOrganizer
        ? await attendeeRecipients.union(
              database.select({ userId: bookings.userId }).from(bookings).where(eq(bookings.bookingId, bookingId)),
          )
        : await attendeeRecipients;
    return recipients.map((row) => row.userId);
}

// Only the organizer or an admin may cancel; canCancelAny is true for admins.
export async function cancelBooking(
    bookingId: string,
    userId: string,
    canCancelAny: boolean,
    cancelReason: string | undefined,
    database: Database,
) {
    const cancelledAt = new Date();
    const result = await database
        .update(bookings)
        .set({
            status: "cancelled",
            cancelledAt,
            cancelledBy: userId,
            cancelReason: cancelReason || null,
            updatedAt: cancelledAt,
        })
        .where(
            and(
                eq(bookings.bookingId, bookingId),
                eq(bookings.status, "active"),
                canCancelAny ? undefined : eq(bookings.userId, userId),
            ),
        )
        .returning({ id: bookings.bookingId });
    return result.at(0);
}

export async function updateBookingAttendance(
    bookingId: string,
    userId: string,
    status: "accepted" | "declined",
    database: Database,
) {
    const result = await database
        .update(attendees)
        .set({ status })
        .where(and(eq(attendees.bookingId, bookingId), eq(attendees.userId, userId)))
        .returning({ id: attendees.bookingId });
    return result.at(0);
}

export async function markBookingNotificationsRead(bookingId: string, userId: string, database: Database) {
    await database
        .update(notifications)
        .set({ status: "read" })
        .where(
            and(
                eq(notifications.bookingId, bookingId),
                eq(notifications.userId, userId),
                eq(notifications.status, "unread"),
            ),
        );
}
