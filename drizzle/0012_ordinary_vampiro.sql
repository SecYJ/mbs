CREATE TABLE "booking_rules" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"max_booking_duration_hours" integer DEFAULT 8 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "booking_rules_singleton" CHECK ("booking_rules"."id" = 1)
);
