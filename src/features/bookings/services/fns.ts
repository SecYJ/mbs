import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, countDistinct, desc, eq, gt, gte, inArray, lt, lte, ne, or } from "drizzle-orm";
import { z } from "zod";

import { getDb, type Database } from "@/db/server";
import { attendees, bookings, equipment, notifications, roomEquipment, rooms, user } from "@/db/schema";
import { getBookingConflictMessage } from "@/features/bookings/services/booking-conflicts";
import { getBookingHistoryItem } from "@/features/bookings/services/booking-history";
import { getBookingCancellationNotificationValues } from "@/features/bookings/services/booking-notifications";
import {
    cancelBookingSchema,
    createBookingSchema,
    updateBookingSchema,
} from "@/features/bookings/schemas/booking.schema";
import { getAttendeesByBooking } from "@/features/bookings/services/booking-attendees";
import { isSuperAdminRole } from "@/lib/roles";
import { authenticatedUserMiddleware } from "@/middleware/auth";
import type { RoomFilters } from "@/features/bookings/services/queries";

const toIso = (value: Date | string) => new Date(value).toISOString();

const getAttendeeIds = (attendeeIds: string[], organizerId: string) =>
    Array.from(new Set(attendeeIds.filter((userId) => userId && userId !== organizerId)));

const validateBookingAttendees = async (database: Database, attendeeIds: string[]) => {
    if (attendeeIds.length === 0) return;

    const existingUsers = await database.select({ id: user.id }).from(user).where(inArray(user.id, attendeeIds));
    if (existingUsers.length !== attendeeIds.length) {
        throw new Error("One or more selected attendees no longer exist");
    }
};

const validateBookingSchedule = async ({
    database,
    roomId,
    startTime,
    endTime,
    excludedBookingId,
}: {
    database: Database;
    roomId: string;
    startTime: Date;
    endTime: Date;
    excludedBookingId?: string;
}) => {
    const durationMs = endTime.getTime() - startTime.getTime();

    if (startTime.getTime() <= Date.now()) {
        throw new Error("Start time must be in the future");
    }

    const [room] = await database
        .select({
            id: rooms.roomId,
            available: rooms.available,
            maxBookingDurationHours: rooms.maxBookingDurationHours,
        })
        .from(rooms)
        .where(eq(rooms.roomId, roomId))
        .limit(1);

    if (!room) {
        throw new Error("Selected room no longer exists");
    }

    const maxDurationMs = room.maxBookingDurationHours * 60 * 60 * 1000;

    if (durationMs > maxDurationMs) {
        throw new Error(`Bookings cannot exceed ${room.maxBookingDurationHours} hours for this room`);
    }

    if (!room.available) {
        throw new Error("Selected room is not available for booking");
    }

    const overlapConditions = [
        eq(bookings.roomId, roomId),
        eq(bookings.status, "active"),
        lt(bookings.startTime, endTime),
        gt(bookings.endTime, startTime),
    ];
    if (excludedBookingId) {
        overlapConditions.push(ne(bookings.bookingId, excludedBookingId));
    }

    const [overlapping] = await database
        .select({
            id: bookings.bookingId,
            title: bookings.title,
            roomName: rooms.name,
            startTime: bookings.startTime,
            endTime: bookings.endTime,
        })
        .from(bookings)
        .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
        .where(and(...overlapConditions))
        .orderBy(asc(bookings.startTime))
        .limit(1);

    if (overlapping) {
        throw new Error(
            getBookingConflictMessage({
                title: overlapping.title,
                roomName: overlapping.roomName,
                startTime: overlapping.startTime,
                endTime: overlapping.endTime,
            }),
        );
    }
};

const roomFiltersSchema = z.object({
    capacity: z.number().int().min(0),
    equipment: z.string().array(),
    location: z.string().array(),
});

const getBookableRoomConditions = (database: Database, filters: RoomFilters) => {
    const conditions = [eq(rooms.available, true)];

    if (filters.capacity > 0) {
        conditions.push(gte(rooms.capacity, filters.capacity));
    }
    if (filters.location.length > 0) {
        conditions.push(inArray(rooms.location, filters.location));
    }
    if (filters.equipment.length > 0) {
        // Relational division: the room must carry every selected equipment name.
        conditions.push(
            inArray(
                rooms.roomId,
                database
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
};

type RoomEquipmentRow = {
    room: typeof rooms.$inferSelect;
    equipmentName: string | null;
};

const groupRoomEquipmentRows = (rows: RoomEquipmentRow[]) => {
    const groupedRooms = new Map<string, RoomEquipmentRow["room"] & { equipment: string[] }>();

    for (const row of rows) {
        const existing = groupedRooms.get(row.room.roomId);
        const target = existing ?? { ...row.room, equipment: [] };
        if (!existing) groupedRooms.set(row.room.roomId, target);
        if (row.equipmentName && !target.equipment.includes(row.equipmentName)) {
            target.equipment.push(row.equipmentName);
        }
    }

    return Array.from(groupedRooms.values());
};

const toBookingRoom = (room: RoomEquipmentRow["room"] & { equipment: string[] }) => ({
    id: room.roomId,
    title: room.name,
    location: room.location,
    capacity: room.capacity,
    maxBookingDurationHours: room.maxBookingDurationHours,
    available: room.available,
    equipment: room.equipment,
});

export const getBookingCalendarDataFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .handler(async ({ context }) => {
        const db = await getDb();
        const session = context.session;

        const roomRows = await db
            .select({
                room: rooms,
                equipmentName: equipment.name,
            })
            .from(rooms)
            .leftJoin(roomEquipment, eq(roomEquipment.roomId, rooms.roomId))
            .leftJoin(equipment, eq(equipment.equipmentId, roomEquipment.equipmentId))
            .where(eq(rooms.available, true))
            .orderBy(asc(rooms.name), asc(equipment.name));

        const groupedRooms = groupRoomEquipmentRows(roomRows);

        const users = await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
            })
            .from(user)
            .where(ne(user.id, session.user.id))
            .orderBy(asc(user.name));

        const attendedBookingRows = await db
            .select({ bookingId: attendees.bookingId })
            .from(attendees)
            .where(eq(attendees.userId, session.user.id));
        const attendedBookingIds = attendedBookingRows.map((row) => row.bookingId);
        const historyWhere =
            attendedBookingIds.length > 0
                ? or(eq(bookings.userId, session.user.id), inArray(bookings.bookingId, attendedBookingIds))
                : eq(bookings.userId, session.user.id);
        const historyRows = await db
            .select({
                booking: bookings,
                room: {
                    name: rooms.name,
                    location: rooms.location,
                },
                organizer: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            })
            .from(bookings)
            .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
            .innerJoin(user, eq(user.id, bookings.userId))
            .where(historyWhere)
            .orderBy(desc(bookings.startTime));
        const historyBookingIds = historyRows.map((row) => row.booking.bookingId);
        const historyAttendeesByBooking = await getAttendeesByBooking(db, historyBookingIds);
        const cancelledByIds = Array.from(
            new Set(
                historyRows
                    .map((row) => row.booking.cancelledBy)
                    .filter((cancelledById): cancelledById is string => !!cancelledById),
            ),
        );
        const cancelledByRows =
            cancelledByIds.length === 0
                ? []
                : await db
                      .select({
                          id: user.id,
                          name: user.name,
                          email: user.email,
                      })
                      .from(user)
                      .where(inArray(user.id, cancelledByIds));
        const cancelledByUser = new Map(cancelledByRows.map((cancelledBy) => [cancelledBy.id, cancelledBy]));

        return {
            currentUserId: session.user.id,
            currentUserRole: session.user.role,
            rooms: groupedRooms.map(toBookingRoom),
            history: historyRows.map((row) =>
                getBookingHistoryItem({
                    booking: {
                        id: row.booking.bookingId,
                        roomId: row.booking.roomId,
                        title: row.booking.title,
                        description: row.booking.description,
                        startTime: row.booking.startTime,
                        endTime: row.booking.endTime,
                        status: row.booking.status,
                        cancelledAt: row.booking.cancelledAt,
                        cancelReason: row.booking.cancelReason,
                    },
                    room: row.room,
                    organizer: row.organizer,
                    cancelledBy: row.booking.cancelledBy
                        ? (cancelledByUser.get(row.booking.cancelledBy) ?? null)
                        : null,
                    attendees: historyAttendeesByBooking.get(row.booking.bookingId) ?? [],
                    currentUserId: session.user.id,
                }),
            ),
            users,
        };
    });

export const getBookingCalendarEventsFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .validator(
        z.object({
            rangeStart: z.iso.datetime(),
            rangeEnd: z.iso.datetime(),
            // Either a single room (room day page, availability ignored so
            // existing bookings in unavailable rooms stay visible) or the
            // calendar's room filters (bookable rooms only).
            roomId: z.uuid().optional(),
            capacity: z.number().int().min(0).default(0),
            equipment: z.string().array().default([]),
            location: z.string().array().default([]),
        }),
    )
    .handler(async ({ context, data }) => {
        const db = await getDb();
        const session = context.session;
        const rangeStart = new Date(data.rangeStart);
        const rangeEnd = new Date(data.rangeEnd);

        const roomScope = data.roomId
            ? eq(bookings.roomId, data.roomId)
            : inArray(
                  bookings.roomId,
                  db
                      .select({ roomId: rooms.roomId })
                      .from(rooms)
                      .where(and(...getBookableRoomConditions(db, data))),
              );

        const bookingRows = await db
            .select({
                booking: bookings,
                organizer: {
                    name: user.name,
                },
            })
            .from(bookings)
            .innerJoin(user, eq(user.id, bookings.userId))
            .where(
                and(
                    eq(bookings.status, "active"),
                    lt(bookings.startTime, rangeEnd),
                    gt(bookings.endTime, rangeStart),
                    roomScope,
                ),
            )
            .orderBy(asc(bookings.startTime));

        const bookingIds = bookingRows.map((row) => row.booking.bookingId);
        const attendeesByBooking = await getAttendeesByBooking(db, bookingIds);
        const now = Date.now();

        // Shaped as FullCalendar EventInput so the calendar renders the
        // payload directly and dialogs can reuse clicked events as-is.
        return bookingRows.map((row) => {
            const bookingAttendees = attendeesByBooking.get(row.booking.bookingId) ?? [];
            const visibleAttendees = bookingAttendees.filter((attendee) => attendee.id !== session.user.id);

            return {
                id: row.booking.bookingId,
                resourceId: row.booking.roomId,
                title: row.booking.title,
                start: toIso(row.booking.startTime),
                end: toIso(row.booking.endTime),
                extendedProps: {
                    resourceId: row.booking.roomId,
                    organizer: row.organizer.name,
                    attendees: visibleAttendees.map((attendee) => attendee.name),
                    attendeeIds: visibleAttendees.map((attendee) => attendee.id),
                    description: row.booking.description ?? "",
                    canManage: row.booking.userId === session.user.id && new Date(row.booking.endTime).getTime() > now,
                },
            };
        });
    });

export const getBookingCalendarRoomsFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .validator(roomFiltersSchema)
    .handler(async ({ data }) => {
        const db = await getDb();
        const roomRows = await db
            .select({
                room: rooms,
                equipmentName: equipment.name,
            })
            .from(rooms)
            .leftJoin(roomEquipment, eq(roomEquipment.roomId, rooms.roomId))
            .leftJoin(equipment, eq(equipment.equipmentId, roomEquipment.equipmentId))
            .where(and(...getBookableRoomConditions(db, data)))
            .orderBy(asc(rooms.name), asc(equipment.name));

        return {
            rooms: groupRoomEquipmentRows(roomRows).map(toBookingRoom),
        };
    });

export const getBookingRoomFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .validator(z.object({ roomId: z.uuid() }))
    .handler(async ({ data }) => {
        const db = await getDb();
        // No availability filter: the room day page guard needs disabled rooms
        // too so it can tell "missing" (404) from "disabled" (redirect) apart.
        const roomRows = await db
            .select({
                room: rooms,
                equipmentName: equipment.name,
            })
            .from(rooms)
            .leftJoin(roomEquipment, eq(roomEquipment.roomId, rooms.roomId))
            .leftJoin(equipment, eq(equipment.equipmentId, roomEquipment.equipmentId))
            .where(eq(rooms.roomId, data.roomId))
            .orderBy(asc(equipment.name));

        const [groupedRoom] = groupRoomEquipmentRows(roomRows);

        return groupedRoom ? toBookingRoom(groupedRoom) : null;
    });

export const getBookingCalendarRoomCatalogFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .handler(async () => {
        const db = await getDb();
        const [totalRoomCountRow] = await db.select({ value: count() }).from(rooms).where(eq(rooms.available, true));

        const equipmentRows = await db
            .selectDistinct({ name: equipment.name })
            .from(equipment)
            .innerJoin(roomEquipment, eq(roomEquipment.equipmentId, equipment.equipmentId))
            .innerJoin(rooms, and(eq(rooms.roomId, roomEquipment.roomId), eq(rooms.available, true)))
            .orderBy(asc(equipment.name));

        const locationRows = await db
            .selectDistinct({ location: rooms.location })
            .from(rooms)
            .where(eq(rooms.available, true))
            .orderBy(asc(rooms.location));

        return {
            totalRoomCount: totalRoomCountRow?.value ?? 0,
            allEquipment: equipmentRows.map((row) => row.name),
            allLocations: locationRows.map((row) => row.location),
        };
    });

export const getCalendarSummaryFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .handler(async () => {
        const db = await getDb();
        const now = new Date();
        const bookableBookingConditions = [eq(bookings.status, "active"), eq(rooms.available, true)];

        const [bookingCountRow] = await db
            .select({ value: count() })
            .from(bookings)
            .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
            .where(and(...bookableBookingConditions));

        const [liveBookingCountRow] = await db
            .select({ value: count() })
            .from(bookings)
            .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
            .where(and(...bookableBookingConditions, lte(bookings.startTime, now), gt(bookings.endTime, now)));

        return {
            bookingCount: bookingCountRow?.value ?? 0,
            liveBookingCount: liveBookingCountRow?.value ?? 0,
        };
    });

export const getBookingDetailsFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .validator(z.object({ bookingId: z.uuid() }))
    .handler(async ({ context, data }) => {
        const db = await getDb();
        const session = context.session;

        const [bookingRow] = await db
            .select({
                booking: bookings,
                room: {
                    id: rooms.roomId,
                    name: rooms.name,
                    location: rooms.location,
                    capacity: rooms.capacity,
                    maxBookingDurationHours: rooms.maxBookingDurationHours,
                    available: rooms.available,
                },
                organizer: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            })
            .from(bookings)
            .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
            .innerJoin(user, eq(user.id, bookings.userId))
            .where(eq(bookings.bookingId, data.bookingId))
            .limit(1);

        if (!bookingRow) {
            throw new Error("Booking no longer exists");
        }

        const attendeeRows = await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                status: attendees.status,
            })
            .from(attendees)
            .innerJoin(user, eq(user.id, attendees.userId))
            .where(eq(attendees.bookingId, data.bookingId))
            .orderBy(asc(user.name));

        const equipmentRows = await db
            .select({
                name: equipment.name,
                brand: equipment.brand,
                model: equipment.model,
            })
            .from(roomEquipment)
            .innerJoin(equipment, eq(equipment.equipmentId, roomEquipment.equipmentId))
            .where(eq(roomEquipment.roomId, bookingRow.booking.roomId))
            .orderBy(asc(equipment.name));

        const [cancelledBy] = bookingRow.booking.cancelledBy
            ? await db
                  .select({
                      id: user.id,
                      name: user.name,
                      email: user.email,
                  })
                  .from(user)
                  .where(eq(user.id, bookingRow.booking.cancelledBy))
                  .limit(1)
            : [];

        const currentUserAttendee = attendeeRows.find((attendee) => attendee.id === session.user.id) ?? null;
        const visibleAttendees = attendeeRows.filter((attendee) => attendee.id !== session.user.id);
        const now = Date.now();
        const isOrganizer = bookingRow.booking.userId === session.user.id;
        const isFutureBooking = new Date(bookingRow.booking.endTime).getTime() > now;

        return {
            booking: {
                id: bookingRow.booking.bookingId,
                title: bookingRow.booking.title,
                description: bookingRow.booking.description ?? "",
                start: toIso(bookingRow.booking.startTime),
                end: toIso(bookingRow.booking.endTime),
                status: bookingRow.booking.status,
                cancelledAt: bookingRow.booking.cancelledAt ? toIso(bookingRow.booking.cancelledAt) : null,
                cancelReason: bookingRow.booking.cancelReason ?? "",
                createdAt: bookingRow.booking.createdAt ? toIso(bookingRow.booking.createdAt) : null,
                updatedAt: bookingRow.booking.updatedAt ? toIso(bookingRow.booking.updatedAt) : null,
            },
            room: bookingRow.room,
            equipment: equipmentRows,
            organizer: bookingRow.organizer,
            cancelledBy: cancelledBy ?? null,
            attendees: visibleAttendees,
            currentUserAttendance: currentUserAttendee
                ? {
                      status: currentUserAttendee.status,
                  }
                : null,
            isOrganizer,
            canRespond: !!currentUserAttendee && bookingRow.booking.status === "active" && isFutureBooking,
        };
    });

export const rsvpBookingInviteFn = createServerFn({ method: "POST" })
    .middleware([authenticatedUserMiddleware])
    .validator(
        z.object({
            bookingId: z.string().uuid(),
            status: z.enum(["accepted", "declined"]),
        }),
    )
    .handler(async ({ context, data }) => {
        const db = await getDb();
        const session = context.session;

        const [booking] = await db
            .select({
                id: bookings.bookingId,
                status: bookings.status,
                endTime: bookings.endTime,
            })
            .from(bookings)
            .where(eq(bookings.bookingId, data.bookingId))
            .limit(1);

        if (!booking) {
            throw new Error("Booking no longer exists");
        }

        if (booking.status === "cancelled") {
            throw new Error("Cancelled bookings cannot receive RSVP updates");
        }

        if (new Date(booking.endTime).getTime() <= Date.now()) {
            throw new Error("Past bookings cannot receive RSVP updates");
        }

        const [updatedAttendee] = await db
            .update(attendees)
            .set({ status: data.status })
            .where(and(eq(attendees.bookingId, data.bookingId), eq(attendees.userId, session.user.id)))
            .returning({ bookingId: attendees.bookingId });

        if (!updatedAttendee) {
            throw new Error("Only invited attendees can RSVP to this booking");
        }

        await db
            .update(notifications)
            .set({ status: "read" })
            .where(
                and(
                    eq(notifications.bookingId, data.bookingId),
                    eq(notifications.userId, session.user.id),
                    eq(notifications.status, "unread"),
                ),
            );

        return { id: updatedAttendee.bookingId };
    });

export const createBookingFn = createServerFn({ method: "POST" })
    .middleware([authenticatedUserMiddleware])
    .validator(createBookingSchema)
    .handler(async ({ context, data }) => {
        const db = await getDb();
        const session = context.session;
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const attendeeIds = getAttendeeIds(data.attendeeIds, session.user.id);
        await validateBookingAttendees(db, attendeeIds);
        await validateBookingSchedule({ database: db, roomId: data.roomId, startTime, endTime });

        const created = await db.transaction(async (tx) => {
            const [booking] = await tx
                .insert(bookings)
                .values({
                    roomId: data.roomId,
                    userId: session.user.id,
                    startTime,
                    endTime,
                    title: data.title,
                    description: data.description || null,
                })
                .returning();

            if (!booking) {
                throw new Error("Failed to create booking");
            }

            if (attendeeIds.length > 0) {
                await tx.insert(attendees).values(
                    attendeeIds.map((userId) => ({
                        bookingId: booking.bookingId,
                        userId,
                    })),
                );
            }

            if (attendeeIds.length > 0) {
                await tx.insert(notifications).values(
                    attendeeIds.map((userId) => ({
                        bookingId: booking.bookingId,
                        userId,
                        message: `You've been invited to: ${data.title}`,
                    })),
                );
            }

            return booking;
        });

        return { id: created.bookingId };
    });

export const updateBookingFn = createServerFn({ method: "POST" })
    .middleware([authenticatedUserMiddleware])
    .validator(updateBookingSchema)
    .handler(async ({ context, data }) => {
        const db = await getDb();
        const session = context.session;
        const [existingBooking] = await db
            .select({
                id: bookings.bookingId,
                roomId: bookings.roomId,
                userId: bookings.userId,
                startTime: bookings.startTime,
                endTime: bookings.endTime,
            })
            .from(bookings)
            .where(eq(bookings.bookingId, data.bookingId))
            .limit(1);

        if (!existingBooking) {
            throw new Error("Booking no longer exists");
        }

        if (existingBooking.userId !== session.user.id) {
            throw new Error("You can only edit bookings you created");
        }

        if (new Date(existingBooking.endTime).getTime() <= Date.now()) {
            throw new Error("Past bookings cannot be edited");
        }

        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const attendeeIds = getAttendeeIds(data.attendeeIds, session.user.id);
        const scheduleChanged =
            data.roomId !== existingBooking.roomId ||
            startTime.getTime() !== new Date(existingBooking.startTime).getTime() ||
            endTime.getTime() !== new Date(existingBooking.endTime).getTime();

        await validateBookingAttendees(db, attendeeIds);
        if (scheduleChanged) {
            await validateBookingSchedule({
                database: db,
                roomId: data.roomId,
                startTime,
                endTime,
                excludedBookingId: data.bookingId,
            });
        }

        await db.transaction(async (tx) => {
            const updated = await tx
                .update(bookings)
                .set({
                    roomId: data.roomId,
                    startTime,
                    endTime,
                    title: data.title,
                    description: data.description || null,
                    updatedAt: new Date(),
                })
                .where(and(eq(bookings.bookingId, data.bookingId), eq(bookings.userId, session.user.id)))
                .returning({ id: bookings.bookingId });

            if (updated.length === 0) {
                throw new Error("Failed to update booking");
            }

            await tx.delete(attendees).where(eq(attendees.bookingId, data.bookingId));
            if (attendeeIds.length > 0) {
                await tx.insert(attendees).values(
                    attendeeIds.map((userId) => ({
                        bookingId: data.bookingId,
                        userId,
                    })),
                );
            }

            if (attendeeIds.length > 0) {
                await tx.insert(notifications).values(
                    attendeeIds.map((userId) => ({
                        bookingId: data.bookingId,
                        userId,
                        message: `Booking updated: ${data.title}`,
                    })),
                );
            }
        });

        return { id: data.bookingId };
    });

export const cancelBookingFn = createServerFn({ method: "POST" })
    .middleware([authenticatedUserMiddleware])
    .validator(cancelBookingSchema)
    .handler(async ({ context, data }) => {
        const db = await getDb();
        const session = context.session;
        const [booking] = await db
            .select({
                id: bookings.bookingId,
                userId: bookings.userId,
                status: bookings.status,
                endTime: bookings.endTime,
                startTime: bookings.startTime,
                title: bookings.title,
                roomName: rooms.name,
                roomLocation: rooms.location,
            })
            .from(bookings)
            .innerJoin(rooms, eq(rooms.roomId, bookings.roomId))
            .where(eq(bookings.bookingId, data.bookingId))
            .limit(1);

        if (!booking) {
            throw new Error("Booking no longer exists");
        }

        const isSuperAdmin = isSuperAdminRole(session.user.role);

        if (booking.userId !== session.user.id && !isSuperAdmin) {
            throw new Error("Only a super admin or the booking creator can cancel this booking");
        }

        if (booking.status === "cancelled") {
            throw new Error("Booking is already cancelled");
        }

        if (new Date(booking.endTime).getTime() <= Date.now()) {
            throw new Error("Past bookings cannot be cancelled");
        }

        const attendeeRows = await db
            .select({ userId: attendees.userId })
            .from(attendees)
            .where(eq(attendees.bookingId, data.bookingId));
        const attendeeIds = attendeeRows.map((attendee) => attendee.userId);
        const cancelledAt = new Date();

        await db.transaction(async (tx) => {
            const updated = await tx
                .update(bookings)
                .set({
                    status: "cancelled",
                    cancelledAt,
                    cancelledBy: session.user.id,
                    cancelReason: data.cancelReason || null,
                    updatedAt: cancelledAt,
                })
                .where(
                    isSuperAdmin
                        ? and(eq(bookings.bookingId, data.bookingId), eq(bookings.status, "active"))
                        : and(
                              eq(bookings.bookingId, data.bookingId),
                              eq(bookings.userId, session.user.id),
                              eq(bookings.status, "active"),
                          ),
                )
                .returning({ id: bookings.bookingId });

            if (updated.length === 0) {
                throw new Error("Failed to cancel booking");
            }

            if (attendeeIds.length > 0) {
                await tx.insert(notifications).values(
                    getBookingCancellationNotificationValues({
                        attendeeIds,
                        booking: {
                            id: booking.id,
                            title: booking.title,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            roomName: booking.roomName,
                            roomLocation: booking.roomLocation,
                        },
                    }),
                );
            }
        });

        return { id: data.bookingId };
    });
