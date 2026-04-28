import { sql } from "drizzle-orm";
import { id } from "@/db/helpers";
import {
    bigint,
    boolean,
    check,
    date,
    foreignKey,
    integer,
    numeric,
    pgEnum,
    pgTable,
    primaryKey,
    smallint,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const user = pgTable("user", {
    id: text().primaryKey(),
    name: text().notNull(),
    email: text().unique().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text(),
    role: userRoleEnum().default("user").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const session = pgTable(
    "session",
    {
        id: text().primaryKey(),
        userId: text("user_id").notNull(),
        token: text().unique().notNull(),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => {
        return [
            foreignKey({
                columns: [table.userId],
                foreignColumns: [user.id],
                name: "session_user_id_fk",
            }).onDelete("cascade"),
        ];
    },
);

export const account = pgTable(
    "account",
    {
        id: text().primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id").notNull(),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
        scope: text(),
        password: text(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => {
        return [
            foreignKey({
                columns: [table.userId],
                foreignColumns: [user.id],
                name: "account_user_id_fk",
            }).onDelete("cascade"),
        ];
    },
);

export const verification = pgTable("verification", {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const rateLimit = pgTable("rateLimit", {
    id: text().primaryKey(),
    key: text().unique().notNull(),
    count: integer().notNull(),
    lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const rooms = pgTable("rooms", {
    roomId: id("room_id"),
    name: text().notNull(),
    location: text().notNull(),
    available: boolean().default(true).notNull(),
    capacity: integer().notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const bookings = pgTable(
    "bookings",
    {
        bookingId: id("booking_id"),
        roomId: uuid("room_id").notNull(),
        userId: text("user_id").notNull(),
        startTime: timestamp("start_time", { withTimezone: true }).notNull(),
        endTime: timestamp("end_time", { withTimezone: true }).notNull(),
        title: text().notNull(),
        description: text(),

        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (table) => {
        return [
            foreignKey({
                columns: [table.roomId],
                foreignColumns: [rooms.roomId],
                name: "bookings_room_id_fk",
            }),
            foreignKey({
                columns: [table.userId],
                foreignColumns: [user.id],
                name: "bookings_user_id_fk",
            }),
        ];
    },
);

export const attendees = pgTable(
    "attendees",
    {
        userId: text("user_id").notNull(),
        bookingId: uuid("booking_id").notNull(),
        accepted: boolean().default(false).notNull(),
    },
    (table) => {
        return [
            primaryKey({
                columns: [table.bookingId, table.userId],
            }),
            foreignKey({
                columns: [table.bookingId],
                foreignColumns: [bookings.bookingId],
                name: "attendees_booking_id_fk",
            }),
            foreignKey({
                columns: [table.userId],
                foreignColumns: [user.id],
                name: "attendees_user_id_fk",
            }),
        ];
    },
);

export const notificationStatusEnum = pgEnum("notification_status", ["read", "unread", "pending"]);
export const notifications = pgTable(
    "notifications",
    {
        notificationId: id("notification_id"),
        bookingId: uuid("booking_id").notNull(),
        message: text().notNull(),
        status: notificationStatusEnum().default("unread").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (table) => {
        return [
            foreignKey({
                columns: [table.bookingId],
                foreignColumns: [bookings.bookingId],
                name: "notifications_booking_id_fk",
            }),
        ];
    },
);

export const equipment = pgTable("equipment", {
    equipmentId: id("equipment_id"),
    name: text().notNull(),
    brand: text().notNull(),
    model: text().notNull(),
    price: numeric({ precision: 10, scale: 2, mode: "number" }).notNull(),
    quantity: integer().default(1).notNull(),
    purchaseDate: date("purchase_date").notNull(),
    warrantyExpiry: date("warranty_expiry"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const facilities = pgTable("facilities", {
    facilityId: id("facility_id"),
    name: text().notNull(),
    description: text(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const roomFacilities = pgTable(
    "room_facilities",
    {
        roomId: uuid("room_id").notNull(),
        facilityId: uuid("facility_id").notNull(),
        quantity: integer().default(0).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (table) => {
        return [
            primaryKey({
                columns: [table.roomId, table.facilityId],
            }),
            foreignKey({
                columns: [table.roomId],
                foreignColumns: [rooms.roomId],
                name: "room_facilities_room_id_fk",
            }),
            foreignKey({
                columns: [table.facilityId],
                foreignColumns: [facilities.facilityId],
                name: "room_facilities_facility_id_fk",
            }),
        ];
    },
);

export const bookingRules = pgTable(
    "booking_rules",
    {
        id: smallint().primaryKey().default(1).notNull(),
        maxBookingDurationHours: integer("max_booking_duration_hours").default(8).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (table) => {
        return [check("booking_rules_singleton", sql`${table.id} = 1`)];
    },
);

export const roomEquipment = pgTable(
    "room_equipment",
    {
        roomId: uuid("room_id").notNull(),
        equipmentId: uuid("equipment_id").notNull(),
        quantity: integer().default(1).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (table) => {
        return [
            primaryKey({
                columns: [table.roomId, table.equipmentId],
            }),
            foreignKey({
                columns: [table.roomId],
                foreignColumns: [rooms.roomId],
                name: "room_equipment_room_id_fk",
            }),
            foreignKey({
                columns: [table.equipmentId],
                foreignColumns: [equipment.equipmentId],
                name: "room_equipment_equipment_id_fk",
            }),
        ];
    },
);
