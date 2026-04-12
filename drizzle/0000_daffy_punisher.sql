CREATE TYPE "public"."notification_status" AS ENUM('read', 'unread', 'pending');--> statement-breakpoint
CREATE TABLE "attendees" (
	"user_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"accepted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "attendees_booking_id_user_id_pk" PRIMARY KEY("booking_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"booking_id" uuid PRIMARY KEY NOT NULL,
	"room_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"facility_id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" uuid PRIMARY KEY NOT NULL,
	"booking_id" uuid NOT NULL,
	"message" text NOT NULL,
	"status" "notification_status" DEFAULT 'unread' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "room_facilities" (
	"room_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "room_facilities_room_id_facility_id_pk" PRIMARY KEY("room_id","facility_id")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"room_id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"capacity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"title" text,
	"role" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "attendees" ADD CONSTRAINT "attendees_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("booking_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendees" ADD CONSTRAINT "attendees_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("room_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("booking_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("room_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_facility_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("facility_id") ON DELETE no action ON UPDATE no action;