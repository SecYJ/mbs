import { id } from "@/db/helpers";
import { boolean, foreignKey, integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	userId: id("user_id"),
	username: text().notNull(),
	password: text().notNull(),
	email: text().unique().notNull(),
	title: text(),
	role: text().notNull(),
	active: boolean().default(true).notNull(),

	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
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
		userId: uuid("user_id").notNull(),
		startTime: timestamp("start_time", { withTimezone: true }).notNull(),
		endTime: timestamp("end_time", { withTimezone: true }).notNull(),

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
				foreignColumns: [users.userId],
				name: "bookings_user_id_fk",
			}),
		];
	},
);

export const attendees = pgTable(
	"attendees",
	{
		userId: uuid("user_id").notNull(),
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
				foreignColumns: [users.userId],
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
