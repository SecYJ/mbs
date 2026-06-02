import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, gt, inArray, lt, ne, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { attendees, bookings, bookingRules, equipment, notifications, roomEquipment, rooms, user } from "@/db/schema";
import { PAST_BOOKING_START_MESSAGE } from "@/features/bookings/booking.constants";
import { getBookingConflictMessage } from "@/features/bookings/services/booking-conflicts";
import { getBookingHistoryItem } from "@/features/bookings/services/booking-history";
import { getBookingCancellationNotificationValues } from "@/features/bookings/services/booking-notifications";
import {
    cancelBookingSchema,
    createBookingSchema,
    updateBookingSchema,
} from "@/features/bookings/schemas/booking.schema";
import { authenticatedUserMiddleware } from "@/middleware/auth";

const DEFAULT_MAX_BOOKING_DURATION_HOURS = 8;
const BOOKING_RULES_ID = 1;

type BookingUser = {
    id: string;
    name: string;
    email: string;
    status: "pending" | "accepted" | "declined";
};

const toIso = (value: Date | string) => new Date(value).toISOString();

const getAttendeeIds = (attendeeIds: string[], organizerId: string) =>
    Array.from(new Set(attendeeIds.filter((userId) => userId && userId !== organizerId)));

const getAttendeesByBooking = async (bookingIds: string[]) => {
    const attendeeRows =
        bookingIds.length === 0
            ? []
            : await db
                  .select({
                      bookingId: attendees.bookingId,
                      attendee: {
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          status: attendees.status,
                      },
                  })
                  .from(attendees)
                  .innerJoin(user, eq(user.id, attendees.userId))
                  .where(inArray(attendees.bookingId, bookingIds));

    const attendeesByBooking = new Map<string, BookingUser[]>();
    for (const row of attendeeRows) {
        const existing = attendeesByBooking.get(row.bookingId) ?? [];
        existing.push(row.attendee);
        attendeesByBooking.set(row.bookingId, existing);
    }

    return attendeesByBooking;
};

const getBookingRules = async () => {
    const [rules] = await db.select().from(bookingRules).where(eq(bookingRules.id, BOOKING_RULES_ID)).limit(1);
    return rules ?? { maxBookingDurationHours: DEFAULT_MAX_BOOKING_DURATION_HOURS };
};

const validateBookingDetails = async ({
    roomId,
    startTime,
    endTime,
    attendeeIds,
    excludedBookingId,
}: {
    roomId: string;
    startTime: Date;
    endTime: Date;
    attendeeIds: string[];
    excludedBookingId?: string;
}) => {
    const durationMs = endTime.getTime() - startTime.getTime();

    if (startTime.getTime() <= Date.now()) {
        throw new Error(PAST_BOOKING_START_MESSAGE);
    }

    const rules = await getBookingRules();
    const maxDurationMs = rules.maxBookingDurationHours * 60 * 60 * 1000;

    if (durationMs > maxDurationMs) {
        throw new Error(`Bookings cannot exceed ${rules.maxBookingDurationHours} hours`);
    }

    const [room] = await db
        .select({ id: rooms.roomId, available: rooms.available })
        .from(rooms)
        .where(eq(rooms.roomId, roomId))
        .limit(1);

    if (!room) {
        throw new Error("Selected room no longer exists");
    }

    if (!room.available) {
        throw new Error("Selected room is not available for booking");
    }

    if (attendeeIds.length > 0) {
        const existingUsers = await db.select({ id: user.id }).from(user).where(inArray(user.id, attendeeIds));
        if (existingUsers.length !== attendeeIds.length) {
            throw new Error("One or more selected attendees no longer exist");
        }
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

    const [overlapping] = await db
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

export const getBookingCalendarDataFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .handler(async ({ context }) => {
        const session = context.session;

        const roomRows = await db
            .select({
                room: rooms,
                equipmentName: equipment.name,
            })
            .from(rooms)
            .leftJoin(roomEquipment, eq(roomEquipment.roomId, rooms.roomId))
            .leftJoin(equipment, eq(equipment.equipmentId, roomEquipment.equipmentId))
            .orderBy(asc(rooms.name));

        type RoomRow = (typeof roomRows)[number]["room"];
        const groupedRooms = new Map<string, RoomRow & { equipment: string[] }>();

        for (const row of roomRows) {
            const existing = groupedRooms.get(row.room.roomId);
            const target = existing ?? { ...row.room, equipment: [] };
            if (!existing) groupedRooms.set(row.room.roomId, target);
            if (row.equipmentName && !target.equipment.includes(row.equipmentName)) {
                target.equipment.push(row.equipmentName);
            }
        }

        const bookingRows = await db
            .select({
                booking: bookings,
                organizer: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            })
            .from(bookings)
            .innerJoin(user, eq(user.id, bookings.userId))
            .where(eq(bookings.status, "active"))
            .orderBy(asc(bookings.startTime));

        const bookingIds = bookingRows.map((row) => row.booking.bookingId);
        const attendeesByBooking = await getAttendeesByBooking(bookingIds);

        const users = await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
            })
            .from(user)
            .where(ne(user.id, session.user.id))
            .orderBy(asc(user.name));

        const now = Date.now();
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
        const historyAttendeesByBooking = await getAttendeesByBooking(historyBookingIds);
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
            rooms: Array.from(groupedRooms.values()).map((room) => ({
                id: room.roomId,
                title: room.name,
                location: room.location,
                capacity: room.capacity,
                available: room.available,
                equipment: room.equipment,
            })),
            events: bookingRows.map((row) => ({
                id: row.booking.bookingId,
                roomId: row.booking.roomId,
                title: row.booking.title,
                start: toIso(row.booking.startTime),
                end: toIso(row.booking.endTime),
                description: row.booking.description ?? "",
                organizer: row.organizer,
                attendees: attendeesByBooking.get(row.booking.bookingId) ?? [],
                canManage: row.booking.userId === session.user.id && new Date(row.booking.endTime).getTime() > now,
            })),
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

export const getBookingDetailsFn = createServerFn({ method: "GET" })
    .middleware([authenticatedUserMiddleware])
    .inputValidator(
        z.object({
            bookingId: z.uuid(),
        }),
    )
    .handler(async ({ context, data }) => {
        const session = context.session;

        const [bookingRow] = await db
            .select({
                booking: bookings,
                room: {
                    id: rooms.roomId,
                    name: rooms.name,
                    location: rooms.location,
                    capacity: rooms.capacity,
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
        const now = Date.now();
        const isOrganizer = bookingRow.booking.userId === session.user.id;
        const isFutureBooking = new Date(bookingRow.booking.endTime).getTime() > now;

        return {
            currentUserId: session.user.id,
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
            attendees: attendeeRows,
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
    .inputValidator(
        z.object({
            bookingId: z.string().uuid(),
            status: z.enum(["accepted", "declined"]),
        }),
    )
    .handler(async ({ context, data }) => {
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
    .inputValidator(createBookingSchema)
    .handler(async ({ context, data }) => {
        const session = context.session;
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const attendeeIds = getAttendeeIds(data.attendeeIds, session.user.id);
        await validateBookingDetails({ roomId: data.roomId, startTime, endTime, attendeeIds });

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
    .inputValidator(updateBookingSchema)
    .handler(async ({ context, data }) => {
        const session = context.session;
        const [existingBooking] = await db
            .select({
                id: bookings.bookingId,
                userId: bookings.userId,
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
        await validateBookingDetails({
            roomId: data.roomId,
            startTime,
            endTime,
            attendeeIds,
            excludedBookingId: data.bookingId,
        });

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
    .inputValidator(cancelBookingSchema)
    .handler(async ({ context, data }) => {
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

        if (booking.userId !== session.user.id) {
            throw new Error("You can only cancel bookings you created");
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
                    and(
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
